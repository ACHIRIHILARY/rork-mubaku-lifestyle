import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { MessageCircle, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export default function MessagesScreen() {
    const { t } = useTranslation();

    // Mock data - replace with actual API call
    const conversations = [
        {
            id: '1',
            provider: {
                id: 1,
                name: 'Beauty Studio Pro',
                avatar: null,
            },
            lastMessage: {
                content: 'Hi! I received your booking request. When would you like to schedule?',
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                isFromProvider: true,
                unread: true,
            },
        },
        {
            id: '2',
            provider: {
                id: 2,
                name: 'Hair Masters',
                avatar: null,
            },
            lastMessage: {
                content: 'Thank you for your review! We appreciate your feedback.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                isFromProvider: true,
                unread: false,
            },
        },
        {
            id: '3',
            provider: {
                id: 3,
                name: 'Relax Spa Center',
                avatar: null,
            },
            lastMessage: {
                content: 'Your appointment has been confirmed for tomorrow at 3 PM.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                isFromProvider: true,
                unread: false,
            },
        },
    ];

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) return 'now';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInHours < 24) return `${diffInHours}h`;
        if (diffInDays < 7) return `${diffInDays}d`;
        return date.toLocaleDateString();
    };

    const handleConversationPress = (conversationId: string) => {
        router.push(`/chat/${conversationId}` as any);
    };

    const unreadCount = conversations.filter(conv => conv.lastMessage.unread).length;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('messages') || 'Messages'}</Text>
                {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{unreadCount}</Text>
                    </View>
                )}
            </View>

            <ScrollView style={styles.content}>
                {conversations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MessageCircle color="#ccc" size={64} />
                        <Text style={styles.emptyTitle}>{t('noMessages') || 'No messages yet'}</Text>
                        <Text style={styles.emptyText}>
                            {t('startConversation') || 'Start a conversation by booking a service or contacting a provider'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.conversationsList}>
                        {conversations.map((conversation) => (
                            <TouchableOpacity
                                key={conversation.id}
                                style={styles.conversationCard}
                                onPress={() => handleConversationPress(conversation.id)}
                            >
                                <View style={styles.conversationLeft}>
                                    <View style={styles.avatarContainer}>
                                        {conversation.provider.avatar ? (
                                            <Image source={{ uri: conversation.provider.avatar }} style={styles.avatar} />
                                        ) : (
                                            <View style={styles.avatarPlaceholder}>
                                                <User color="white" size={20} />
                                            </View>
                                        )}
                                    </View>
                                    {conversation.lastMessage.unread && (
                                        <View style={styles.unreadIndicator} />
                                    )}
                                </View>

                                <View style={styles.conversationContent}>
                                    <View style={styles.conversationHeader}>
                                        <Text style={styles.providerName} numberOfLines={1}>
                                            {conversation.provider.name}
                                        </Text>
                                        <Text style={styles.messageTime}>
                                            {formatTime(conversation.lastMessage.timestamp)}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            styles.lastMessage,
                                            conversation.lastMessage.unread && styles.unreadMessage
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {conversation.lastMessage.isFromProvider && (
                                            <Text style={styles.providerIndicator}></Text>
                                        )}
                                        {conversation.lastMessage.content}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
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
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    unreadBadge: {
        position: 'absolute',
        right: 24,
        backgroundColor: '#FF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D1A46',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    conversationsList: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    conversationCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    conversationLeft: {
        position: 'relative',
        marginRight: 12,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        backgroundColor: '#2D1A46',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadIndicator: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#F4A896',
        borderWidth: 2,
        borderColor: 'white',
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D1A46',
        flex: 1,
    },
    messageTime: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    unreadMessage: {
        fontWeight: '600',
        color: '#2D1A46',
    },
    providerIndicator: {
        fontSize: 14,
        color: '#F4A896',
    },
});
