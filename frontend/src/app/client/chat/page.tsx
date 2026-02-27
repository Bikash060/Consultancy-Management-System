'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import { aiApi } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface FAQ {
    question: string;
    answer: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        loadFaqs();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const loadFaqs = async () => {
        try {
            const res = await aiApi.getFaqs();
            setFaqs(res.data.faqs || []);
        } catch (error) {
            console.error('Failed to load FAQs:', error);
        }
    };

    const handleSend = async (message: string) => {
        if (!message.trim() || loading) return;

        setShowSuggestions(false);
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await aiApi.chat(message);
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: res.data.response,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(input);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setShowSuggestions(true);
    };

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Assistant</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Ask anything about studying abroad</p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearChat}>
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Full Width Chat Area */}
            <Card className="flex-1 flex flex-col min-h-0 overflow-hidden" padding="none">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {messages.length === 0 && showSuggestions ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6">
                                <SparklesIcon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                How can I help you today?
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                                I can help with visa requirements, documents, universities, and more.
                            </p>
                            {/* Suggested Questions - Full Width Grid */}
                            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {faqs.map((faq, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(faq.question)}
                                        className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all duration-200 group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <QuestionIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <span className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{faq.question}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`group flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                                            : 'bg-gradient-to-br from-purple-600 to-blue-600'
                                            }`}>
                                            {msg.role === 'user' ? (
                                                <UserIcon className="w-5 h-5 text-white" />
                                            ) : (
                                                <SparklesIcon className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white'
                                                }`}>
                                                {msg.role === 'user' ? (
                                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                ) : (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:my-2 prose-code:bg-slate-200 dark:prose-code:bg-slate-600 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-800 dark:prose-pre:bg-slate-900 prose-pre:p-3 prose-pre:rounded-lg">
                                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                                <button onClick={() => copyMessage(msg.content)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" title="Copy">
                                                    <CopyIcon className="w-4 h-4" />
                                                </button>
                                                <span className="text-xs text-slate-400">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                            <SparklesIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-700/50 px-4 py-3 rounded-2xl">
                                            <div className="flex gap-1.5">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area - Full Width */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message... (Enter to send)"
                                rows={1}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 px-6"
                        >
                            {loading ? (
                                <LoadingIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <SendIcon className="w-5 h-5" />
                            )}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}

// Icons
function SparklesIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );
}

function UserIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

function CopyIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    );
}

function TrashIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );
}

function QuestionIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
