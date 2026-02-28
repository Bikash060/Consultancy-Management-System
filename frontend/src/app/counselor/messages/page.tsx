'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { messagesApi } from '@/lib/api';
import type { Message, User } from '@/types';

export default function CounselorMessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            loadMessages(selectedUser.id);
        }
    }, [selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const res = await messagesApi.getConversations();
            setConversations(res.data.conversations || []);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (userId: number) => {
        try {
            const res = await messagesApi.getMessages(userId);
            setMessages(res.data.messages || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || sending) return;

        setSending(true);
        try {
            await messagesApi.send(selectedUser.id, newMessage);
            setNewMessage('');
            loadMessages(selectedUser.id);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400">Loading conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <ChatIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Communicate with your clients</p>
                </div>
            </div>

            {/* Full Width Chat Layout */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Conversations List */}
                <div className={`${selectedUser ? 'hidden md:block' : ''} w-full md:w-80 flex-shrink-0`}>
                    <Card className="h-full flex flex-col" padding="none">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Clients ({conversations.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {conversations.length > 0 ? (
                                <div className="space-y-1">
                                    {conversations.map((conv) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedUser(conv)}
                                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${selectedUser?.id === conv.id
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                                                    {conv.profile?.first_name?.[0] || conv.email[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">
                                                        {conv.profile?.first_name} {conv.profile?.last_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{conv.email}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                                        <ChatIcon className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400">No conversations yet</p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                        Clients will appear here when they message you
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Chat Area */}
                <Card className={`${!selectedUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-h-0`} padding="none">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="md:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                >
                                    <BackIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                                    {selectedUser.profile?.first_name?.[0] || selectedUser.email[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        {selectedUser.profile?.first_name} {selectedUser.profile?.last_name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                                {messages.length > 0 ? (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.sender_id === user?.id
                                                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white'
                                                    }`}
                                            >
                                                <p className="leading-relaxed">{msg.content}</p>
                                                <p
                                                    className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-purple-200' : 'text-slate-400'
                                                        }`}
                                                >
                                                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-slate-500 dark:text-slate-400">No messages yet. Start the conversation!</p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <form onSubmit={handleSend} className="flex gap-3">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type your message..."
                                        rows={1}
                                        className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                        disabled={sending}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="px-6"
                                    >
                                        {sending ? (
                                            <LoadingIcon className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <SendIcon className="w-5 h-5" />
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                                <ChatIcon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                Select a conversation
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Choose a client from the list to start messaging
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

// Icons
function ChatIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    );
}

function SendIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
    );
}

function BackIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    );
}

function LoadingIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}
