import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: ChatMessageType[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, history, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [history]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-30 flex justify-end items-end no-print" onClick={onClose}>
            <div
                className="bg-white w-full max-w-lg h-[80vh] max-h-[600px] rounded-t-lg shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-y-0"
                style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-ewa-purple text-white rounded-t-lg">
                    <h3 className="text-lg font-semibold">✨ SAPnAI - SAP niche AI</h3>
                    <button onClick={onClose} className="text-2xl font-light leading-none">&times;</button>
                </div>

                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                    {history.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                    ))}
                    {isLoading && history[history.length-1]?.role === 'user' && (
                         <div className="flex justify-start mb-4">
                            <div className="rounded-lg px-4 py-2 max-w-sm bg-gray-200 text-gray-800">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about the report..."
                            className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ewa-purple"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-ewa-purple text-white p-2 rounded-lg disabled:bg-gray-300 hover:bg-opacity-90 transition-colors"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
