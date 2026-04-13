'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { messagesApi, usersApi } from '@/lib/api';
import type { Message, User } from '@/types';

export default function CounselorMessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<User[]>([]);
    const [clients, setClients] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const convPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const selectedUserRef = useRef<User | null>(null);

    // Keep ref in sync so interval callbacks see latest value
    useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

    useEffect(() => {
        loadData();

        // Poll conversations list every 5s (always running)
        convPollRef.current = setInterval(async () => {
            try {
                const res = await messagesApi.getConversations();
                setConversations(res.data.conversations || []);
            } catch (_) { /* silent */ }
        }, 5000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            if (convPollRef.current) clearInterval(convPollRef.current);
        };
    }, []);

    useEffect(() => {
        if (selectedUser) {
            loadMessages(selectedUser.id);
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = setInterval(() => {
                if (selectedUserRef.current) loadMessages(selectedUserRef.current.id);
            }, 5000);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadData = async () => {
        try {
            const [convRes, clientRes] = await Promise.all([
                messagesApi.getConversations(),
                usersApi.getClients(),
            ]);
            setConversations(convRes.data.conversations || []);
            setClients(clientRes.data.clients || []);
        } catch (error) {
            console.error('Failed to load data:', error);
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

    const handleSelectClient = (client: User) => {
        setSelectedUser(client);
        setShowNewChat(false);
        if (!conversations.find(c => c.id === client.id)) {
            setConversations(prev => [client, ...prev]);
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
            messagesApi.getConversations().then(res => setConversations(res.data.conversations || [])).catch(() => {});
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

    // Clients not yet in conversations
    const availableClients = clients.filter(c => !conversations.find(conv => conv.id === c.id));

    if (loading) {
        return (
            <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <ChatIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Communicate with your clients</p>
                    </div>
                </div>
                {clients.length > 0 && (
                    <Button onClick={() => setShowNewChat(!showNewChat)} size="sm" className="!bg-gradient-to-r !from-purple-600 !to-pink-600">
                        <PlusIcon className="w-4 h-4 mr-1" /> New Chat
                    </Button>
                )}
            </div>

            {/* Full Width Chat Layout */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Sidebar */}
                <div className={`${selectedUser && !showNewChat ? 'hidden md:block' : ''} w-full md:w-80 flex-shrink-0`}>
                    <Card className="h-full flex flex-col" padding="none">
                        {/* New Chat Panel */}
                        {showNewChat && (
                            <div className="border-b border-slate-200 dark:border-slate-700">
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Choose a Client</h3>
                                        <button onClick={() => setShowNewChat(false)} className="p-1 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    {availableClients.length > 0 ? (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {availableClients.map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => handleSelectClient(c)}
                                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all text-left"
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium text-sm">
                                                        {c.profile?.first_name?.[0] || c.email[0].toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                            {c.profile?.first_name} {c.profile?.last_name}
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{c.email}</p>
                                                    </div>
                                                    <ChatIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
                                            {clients.length === 0 ? 'No clients available' : 'You have chats with all clients'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Clients ({conversations.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {conversations.length > 0 ? (
                                <div className="space-y-1">
                                    {conversations.map((conv) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => { setSelectedUser(conv); setShowNewChat(false); }}
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
                                    <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">No conversations yet</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">Start by choosing a client to message</p>
                                    {clients.length > 0 && (
                                        <Button size="sm" onClick={() => setShowNewChat(true)}>
                                            Choose Client
                                        </Button>
                                    )}
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
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                                            <ChatIcon className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                                        </div>
                                        <p className="text-slate-900 dark:text-white font-medium mb-1">Start the conversation!</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Say hello to {selectedUser.profile?.first_name || 'your client'}</p>
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
                                {conversations.length > 0 ? 'Select a conversation' : 'Start a conversation'}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                {conversations.length > 0
                                    ? 'Choose a conversation from the list or start a new chat'
                                    : 'Choose a client to start messaging'}
                            </p>
                            {clients.length > 0 && (
                                <Button onClick={() => setShowNewChat(true)} className="!bg-gradient-to-r !from-purple-600 !to-pink-600">
                                    <PlusIcon className="w-4 h-4 mr-1.5" /> Choose Client
                                </Button>
                            )}
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

function PlusIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
