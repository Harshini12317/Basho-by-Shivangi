"use client";

import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';

interface Message {
  _id: string;
  customOrderId: string;
  senderId: string;
  senderType: 'customer' | 'admin';
  message: string;
  timestamp: string | Date;
}

interface ChatComponentProps {
  customOrderId: string;
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
}

export default function ChatComponent({ customOrderId, isOpen, onClose, customerName }: ChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      inputRef.current?.focus();
    }
  }, [isOpen, customOrderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add ESC key support to close chat
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages?customOrderId=${customOrderId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customOrderId,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      {/* Close button on backdrop */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors z-10"
        title="Close chat"
      >
        <FaTimes className="text-xl" />
      </button>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
        {/* Header - Always visible */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white rounded-t-2xl sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold truncate">Chat - Order #{customOrderId.slice(-8)}</h3>
            {customerName && <p className="text-xs opacity-90 truncate">with {customerName}</p>}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs opacity-75 hidden sm:inline">ESC to close</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors border border-white/30 hover:border-white/60"
              title="Close chat (ESC)"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E5022]"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 py-8">
              <div className="text-center">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.senderType === 'customer' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                    message.senderType === 'customer'
                      ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      : 'bg-[#8E5022] text-white rounded-br-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderType === 'customer' ? 'text-gray-500' : 'text-orange-100'
                  }`}>
                    {new Date(message.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8E5022] focus:border-transparent"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="px-6 py-2 bg-[#8E5022] hover:bg-[#652810] disabled:bg-gray-400 text-white rounded-full transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FaPaperPlane className="text-sm" />
              )}
              Send
            </button>
          </div>
          {/* Additional close button at bottom */}
          <div className="flex justify-center mt-3">
            <button
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Close Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}