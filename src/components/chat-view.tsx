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
import { Bot, FileText, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b p-3 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden"><Menu size={20} /></Button>
            <div className="w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <Bot size={20} />
            </div>
            <h1 className="font-semibold text-foreground truncate">{chatDetails?.title || 'Chat'}</h1>
          </div>
          <div className="flex items-center gap-2">
            {chatDetails?.has_pdf && (
                <Button onClick={() => setShowDocPanel(!showDocPanel)} variant="secondary" size="sm" className="gap-2">
                    <FileText size={16} /> <span className="hidden sm:inline">Documents</span>
                </Button>
            )}
          </div>
        </div>
      </header>
      
      {showDocPanel && (
        <DocumentPanel docs={documents} isLoading={false} onClose={() => setShowDocPanel(false)} onDelete={handleDeleteDoc}/>
      )}

      <MessageList messages={messages} isLoading={isSending} />
      <ChatInput onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} disabled={isSending || isUploading} isUploading={isUploading} />
    </div>
  );
}
