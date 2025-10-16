/**
 * @file Main client component that orchestrates the entire chat interface.
 * It receives initial data as props and handles all user interactions.
 */
'use client';

import React, { useState, useRef } from 'react';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';
import { DocumentPanel } from '@/components/document-panel';
import * as api from '@/lib/api';
import { Message, Document, Chat } from '@/types';
import { useToasts } from '@/lib/hooks/use-toasts';
import { Bot, FileText, Menu, Upload, Loader } from 'lucide-react';

interface ChatViewProps {
  chatId: string;
  initialMessages: Message[];
  initialDocuments: Document[];
  initialChatDetails: Chat;
}

export function ChatView({ chatId, initialMessages, initialDocuments, initialChatDetails }: ChatViewProps) {
  const { addToast } = useToasts();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chatDetails, setChatDetails] = useState<Chat | null>(initialChatDetails);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  
  const [isSending, setIsSending] = useState(false);
  
  // UI State
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (inputText: string) => {
    setIsSending(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const botResponse = await api.sendMessageToChat(chatId, inputText);
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
       addToast('error', 'Failed to send message');
       const errorMessage: Message = {
         id: (Date.now() + 1).toString(), text: 'Sorry, an error occurred.',
         sender: 'bot', timestamp: new Date().toISOString(), isError: true,
       };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    addToast('info', 'Uploading document...', file.name);

    try {
        await api.uploadFile(chatId, file, (progress) => console.log(progress));
        addToast('success', 'Upload complete!', `${file.name} is ready.`);
        // Refresh documents and chat details
        const [updatedDocs, chats] = await Promise.all([
          api.getChatDocs(chatId),
          api.getChats()
        ]);
        setDocuments(updatedDocs);
        setChatDetails(chats.find(c => c.id === chatId) || null);
    } catch (error) {
        addToast('error', 'Upload failed', (error as Error).message);
    } finally {
        setIsUploading(false);
    }
  };
  
  const handleDeleteDoc = async (docName: string) => {
    if(!window.confirm(`Are you sure you want to remove "${docName}"?`)) return;
    try {
        await api.deleteDoc(chatId, docName);
        addToast('success', 'Document removed');
        setDocuments(prev => prev.filter(d => d.name !== docName));
    } catch (error) {
        addToast('error', 'Failed to remove document', (error as Error).message);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-3 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Menu size={20} /></button>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <h1 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{chatDetails?.title || 'Chat'}</h1>
          </div>
          <div className="flex items-center gap-2">
            {chatDetails?.has_pdf && (
                <button onClick={() => setShowDocPanel(!showDocPanel)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors">
                    <FileText size={16} /> <span className="hidden sm:inline">Documents</span>
                </button>
            )}
             <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
                {isUploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />} <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload'}</span>
             </button>
             <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} className="hidden" />
          </div>
        </div>
      </header>
      
      {showDocPanel && (
        <DocumentPanel docs={documents} isLoading={false} onClose={() => setShowDocPanel(false)} onDelete={handleDeleteDoc}/>
      )}

      <MessageList messages={messages} isLoading={isSending} />
      <ChatInput onSendMessage={handleSendMessage} disabled={isSending || isUploading} />
    </div>
  );
}