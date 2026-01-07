import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, Share } from 'react-native';
import { CheckCircle, Receipt, MapPin, Clock, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useGetPaymentByIdQuery, useLazyGetPaymentStatusQuery } from '@/store/services/paymentApi';
import { useCompleteAppointmentMutation } from '@/store/services/appointmentApi';

export default function TransactionDetailsScreen() {
    const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
    const [completeAppointment, { isLoading: isCompleting }] = useCompleteAppointmentMutation();
    const [getPaymentStatus] = useLazyGetPaymentStatusQuery();

    const { data: payment, isLoading, error, refetch } = useGetPaymentByIdQuery(paymentId || '', {
        skip: !paymentId,
    });

    const handleCompleteService = async () => {
        if (!payment?.appointment?.id) return;

        Alert.alert(
            'Complete Service',
            'Are you sure you want to mark this service as completed? Funds will be released to the provider.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await completeAppointment(payment.appointment.id).unwrap();
                            Alert.alert('Success', 'Service marked as completed. Funds released to provider.');
                            // Refetch payment to update status
                            refetch();
                        } catch (error) {
                            console.error('Failed to complete service:', error);
                            Alert.alert('Error', 'Could not mark service as completed.');
                        }
                    },
                },
            ]
        );
    };

    const handleViewBooking = () => {
        if (payment?.appointment?.id) {
            router.push(`/booking/status?appointmentId=${payment.appointment.id}` as any);
        }
    };

    const handleShareReceipt = async () => {
        if (!payment) return;

        const receiptData = {
            paymentId: payment.id || 'N/A',
            transactionId: payment.gateway?.transaction_id || 'N/A',
            receiptNumber: payment.gateway?.receipt_number || 'N/A',
            amount: `${payment.amount.currency} ${Math.round(payment.amount.total)}`,
            date: new Date(payment.timestamps?.created_at || '').toLocaleString(),
            service: payment.appointment?.service || 'N/A',
            provider: payment.appointment?.provider_name || 'N/A',
            scheduledDate: new Date(payment.appointment?.scheduled_at || '').toLocaleString(),
            paymentMethod: payment.payment_method?.display_name || 'N/A',
            status: payment.status,
        };

        const receiptText = `
MU BAKU LIFESTYLE - PAYMENT RECEIPT

Payment ID: ${receiptData.paymentId}
Transaction ID: ${receiptData.transactionId}
Receipt Number: ${receiptData.receiptNumber}

Amount Paid: ${receiptData.amount}
Payment Date: ${receiptData.date}
Payment Method: ${receiptData.paymentMethod}

Service: ${receiptData.service}
Provider: ${receiptData.provider}
Scheduled Date: ${receiptData.scheduledDate}

Status: ${receiptData.status.toUpperCase()}

Thank you for using Mu Baku Lifestyle!
    `.trim();

        try {
            await Share.share({
                message: receiptText,
                title: 'Payment Receipt - Mu Baku Lifestyle',
            });
        } catch (error) {
            console.error('Error sharing receipt:', error);
            Alert.alert('Error', 'Unable to share receipt');
        }
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2D1A46" />
                    <Text style={styles.loadingText}>Loading transaction details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !payment) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <AlertCircle color="#EF4444" size={64} />
                    <Text style={styles.errorTitle}>Transaction Not Found</Text>
                    <Text style={styles.errorMessage}>Unable to load transaction details.</Text>
                    <TouchableOpacity
                        style={styles.homeButton}
                        onPress={() => router.replace('/(tabs)' as any)}
                    >
                        <Text style={styles.homeButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isCompleted = payment.appointment?.status === 'completed';
    const canComplete = payment.appointment?.status === 'confirmed' || payment.appointment?.status === 'in_progress';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transaction Details</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Success Banner */}
                <View style={styles.successBanner}>
                    <CheckCircle color="#10B981" size={32} />
                    <View style={styles.successTextContainer}>
                        <Text style={styles.successTitle}>Payment Successful!</Text>
                        <Text style={styles.successMessage}>Your transaction has been completed successfully.</Text>
                    </View>
                </View>

                {/* Transaction Details Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Receipt color="#2D1A46" size={24} />
                        <Text style={styles.cardTitle}>Payment Details</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Transaction ID</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                            {payment.gateway?.transaction_id || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Receipt Number</Text>
                        <Text style={styles.detailValue}>
                            {payment.gateway?.receipt_number || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Amount Paid</Text>
                        <Text style={[styles.detailValue, styles.amountValue]}>
                            {payment.amount.currency} {Math.round(payment.amount.total)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Method</Text>
                        <Text style={styles.detailValue}>
                            {payment.payment_method?.display_name || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Date</Text>
                        <Text style={styles.detailValue}>
                            {formatTime(payment.timestamps?.created_at)}
                        </Text>
                    </View>

                    {payment.escrow && (
                        <View style={styles.escrowInfo}>
                            <Text style={styles.escrowText}>
                                🔒 Funds held securely in escrow until service completion
                            </Text>
                        </View>
                    )}
                </View>

                {/* Service Details Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Clock color="#2D1A46" size={24} />
                        <Text style={styles.cardTitle}>Service Details</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Service</Text>
                        <Text style={styles.detailValue}>
                            {payment.appointment?.service || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Provider</Text>
                        <Text style={styles.detailValue}>
                            {payment.appointment?.provider_name || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Scheduled Date</Text>
                        <Text style={styles.detailValue}>
                            {formatTime(payment.appointment?.scheduled_at)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <Text style={[styles.detailValue, styles.statusValue]}>
                            {payment.appointment?.status?.charAt(0).toUpperCase() + payment.appointment?.status?.slice(1) || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                {canComplete && (
                    <View style={styles.actionCard}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.completeButton]}
                            onPress={handleCompleteService}
                            disabled={isCompleting}
                        >
                            {isCompleting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <CheckCircle color="white" size={20} />
                                    <Text style={styles.actionButtonText}>Mark Service as Completed</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {isCompleted && (
                    <View style={styles.completedCard}>
                        <CheckCircle color="#10B981" size={24} />
                        <Text style={styles.completedText}>Service has been marked as completed</Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleShareReceipt}
                >
                    <Receipt color="#2D1A46" size={20} />
                    <Text style={styles.secondaryButtonText}>Share Receipt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleViewBooking}
                >
                    <Text style={styles.primaryButtonText}>View Booking</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#F4A896',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    successBanner: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    successTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    successTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10B981',
        marginBottom: 4,
    },
    successMessage: {
        fontSize: 14,
        color: '#2D1A46',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D1A46',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D1A46',
        flex: 1,
        textAlign: 'right',
    },
    amountValue: {
        fontSize: 18,
        color: '#10B981',
    },
    statusValue: {
        textTransform: 'capitalize',
    },
    escrowInfo: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    escrowText: {
        fontSize: 13,
        color: '#10B981',
        textAlign: 'center',
    },
    actionCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    completeButton: {
        backgroundColor: '#4CAF50',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    completedCard: {
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    completedText: {
        fontSize: 16,
        color: '#166534',
        fontWeight: '600',
    },
    bottomContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#2D1A46',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2D1A46',
        gap: 8,
    },
    secondaryButtonText: {
        color: '#2D1A46',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D1A46',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    homeButton: {
        backgroundColor: '#2D1A46',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    homeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});