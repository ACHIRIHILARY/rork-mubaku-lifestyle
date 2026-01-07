import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { Star, Camera, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function WriteReviewScreen() {
    const { t } = useTranslation();

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStarPress = (star: number) => {
        setRating(star);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const removePhoto = (index: number) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        setPhotos(newPhotos);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Error', 'Please select a rating.');
            return;
        }
        if (!review.trim()) {
            Alert.alert('Error', 'Please write a review.');
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Implement API call to submit review
            // const response = await submitReview({ appointmentId, rating, review, photos });

            // For now, simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            Alert.alert('Success', 'Review submitted successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch {
            Alert.alert('Error', 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('writeReview')}</Text>
                    <Text style={styles.subtitle}>{t('shareExperience')}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('rating')}</Text>
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                                <Star
                                    size={32}
                                    color={star <= rating ? '#FFD700' : '#E0E0E0'}
                                    fill={star <= rating ? '#FFD700' : 'transparent'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    {rating > 0 && (
                        <Text style={styles.ratingText}>
                            {rating} {rating === 1 ? 'star' : 'stars'}
                        </Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('review')}</Text>
                    <TextInput
                        style={styles.reviewInput}
                        multiline
                        numberOfLines={6}
                        placeholder={t('writeReviewPlaceholder')}
                        value={review}
                        onChangeText={setReview}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('photos')} ({t('optional')})</Text>
                    <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                        <Camera size={24} color="#666" />
                        <Text style={styles.addPhotoText}>{t('addPhoto')}</Text>
                    </TouchableOpacity>

                    {photos.length > 0 && (
                        <View style={styles.photosContainer}>
                            {photos.map((photo, index) => (
                                <View key={index} style={styles.photoWrapper}>
                                    <Image source={{ uri: photo }} style={styles.photo} />
                                    <TouchableOpacity
                                        style={styles.removePhotoButton}
                                        onPress={() => removePhoto(index)}
                                    >
                                        <X size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.submitButtonText}>{t('submitReview')}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContainer: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D1A46',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D1A46',
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    ratingText: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 16,
        color: '#666',
    },
    reviewInput: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: 'white',
        minHeight: 120,
    },
    addPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
        borderColor: '#DDD',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 24,
        backgroundColor: 'white',
    },
    addPhotoText: {
        fontSize: 16,
        color: '#666',
    },
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    photoWrapper: {
        position: 'relative',
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removePhotoButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FF4444',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        backgroundColor: '#2D1A46',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
