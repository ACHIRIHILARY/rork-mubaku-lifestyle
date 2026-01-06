import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ArrowLeft, Send, User, Phone, MoreVertical } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, router } from 'expo-router';

interface Message {
    id: string;
    content: string;
    timestamp: Date;
    isFromUser: boolean;
    senderName?: string;
}

export default function ChatScreen() {
    const { channel_id } = useLocalSearchParams<{ channel_id: string }>();
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const flatListRef = useRef<FlatList>(null);

    // Mock data for the conversation
    const conversationData = {
        provider: {
            id: 1,
            name: 'Beauty Studio Pro',
            avatar: null,
            online: true,
        },
        messages: [
            {
                id: '1',
                content: 'Hi! Thank you for booking with us. How can I help you today?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                isFromUser: false,
                senderName: 'Beauty Studio Pro',
            },
            {
                id: '2',
                content: 'Hi! I was wondering if you have availability this Saturday?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5),
                isFromUser: true,
            },
            {
                id: '3',
                content: 'Yes, we do have availability on Saturday. What time works best for you?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 10),
                isFromUser: false,
                senderName: 'Beauty Studio Pro',
            },
            {
                id: '4',
                content: '2 PM would be perfect. Do you need me to bring anything?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 15),
                isFromUser: true,
            },
            {
                id: '5',
                content: 'No, just bring yourself! We provide everything you need. Looking forward to seeing you at 2 PM.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 20),
                isFromUser: false,
                senderName: 'Beauty Studio Pro',
            },
        ],
    };

    useEffect(() => {
        setMessages(conversationData.messages);
    }, [channel_id, conversationData.messages]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const sendMessage = () => {
        if (!message.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            content: message.trim(),
            timestamp: new Date(),
            isFromUser: true,
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage('');

        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Simulate provider response (for demo purposes)
        setTimeout(() => {
            const responseMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Thank you for your message. We\'ll get back to you soon!',
                timestamp: new Date(),
                isFromUser: false,
                senderName: conversationData.provider.name,
            };
            setMessages(prev => [...prev, responseMessage]);
        }, 2000);
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageContainer,
            item.isFromUser ? styles.userMessageContainer : styles.providerMessageContainer
        ]}>
            <View style={[
                styles.messageBubble,
                item.isFromUser ? styles.userMessageBubble : styles.providerMessageBubble
            ]}>
                {!item.isFromUser && item.senderName && (
                    <Text style={styles.senderName}>{item.senderName}</Text>
                )}
                <Text style={[
                    styles.messageText,
                    item.isFromUser ? styles.userMessageText : styles.providerMessageText
                ]}>
                    {item.content}
                </Text>
                <Text style={[
                    styles.messageTime,
                    item.isFromUser ? styles.userMessageTime : styles.providerMessageTime
                ]}>
                    {formatTime(item.timestamp)}
                </Text>
            </View>
        </View>
    );

    const renderMessageSeparator = ({ leadingItem }: { leadingItem: Message }) => {
        const currentDate = new Date(leadingItem.timestamp).toDateString();
        const previousMessage = messages[messages.indexOf(leadingItem) - 1];
        const previousDate = previousMessage ? new Date(previousMessage.timestamp).toDateString() : null;

        if (currentDate !== previousDate) {
            return (
                <View style={styles.dateSeparator}>
                    <Text style={styles.dateSeparatorText}>
                        {new Date(leadingItem.timestamp).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <View style={styles.providerAvatar}>
                        {conversationData.provider.avatar ? (
                            <Image source={{ uri: conversationData.provider.avatar }} style={styles.avatarImage} />
                        ) : (
                            <User color="white" size={20} />
                        )}
                    </View>
                    <View style={styles.providerInfo}>
                        <Text style={styles.providerName}>{conversationData.provider.name}</Text>
                        <Text style={styles.providerStatus}>
                            {conversationData.provider.online ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Phone color="white" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <MoreVertical color="white" size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.messagesContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ItemSeparatorComponent={renderMessageSeparator}
                />

                {/* Message Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.messageInput}
                        value={message}
                        onChangeText={setMessage}
                        placeholder={t('typeMessage') || 'Type a message...'}
                        placeholderTextColor="#999"
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!message.trim()}
                    >
                        <Send color="white" size={20} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'ios' ? 0 : 12,
    },
    backButton: {
        padding: 8,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    providerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    providerInfo: {
        flex: 1,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    providerStatus: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
    },
    messageContainer: {
        marginBottom: 8,
        flexDirection: 'row',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    providerMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    userMessageBubble: {
        backgroundColor: '#F4A896',
        borderBottomRightRadius: 4,
    },
    providerMessageBubble: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    senderName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    userMessageText: {
        color: 'white',
    },
    providerMessageText: {
        color: '#2D1A46',
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
    },
    userMessageTime: {
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'right',
    },
    providerMessageTime: {
        color: '#999',
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: 16,
    },
    dateSeparatorText: {
        backgroundColor: '#E5E5E5',
        color: '#666',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        maxHeight: 100,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F4A896',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
});
