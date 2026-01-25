import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implement API call to send reset email
            // const response = await forgotPassword({ email });

            // For now, simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            Alert.alert(
                'Success',
                'Password reset link has been sent to your email.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch {
            Alert.alert('Error', 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color="#2D1A46" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Mail color="#F4A896" size={64} />
                </View>

                <Text style={styles.title}>{t('forgotPassword')}</Text>
                <Text style={styles.subtitle}>
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t('email')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.submitButtonText}>{t('sendResetLink')}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backToLoginButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backToLoginText}>{t('backToLogin')}</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D1A46',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D1A46',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: 'white',
    },
    submitButton: {
        backgroundColor: '#2D1A46',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 16,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backToLoginButton: {
        paddingVertical: 12,
    },
    backToLoginText: {
        color: '#F4A896',
        fontSize: 16,
        fontWeight: '600',
    },
});
