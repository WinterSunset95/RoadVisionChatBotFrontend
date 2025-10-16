/**
 * @file Main client component that orchestrates the entire chat interface.
 * It receives initial data as props and handles all user interactions.
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';
import { DocumentPanel } from '@/components/document-panel';
import { Sidebar } from '@/components/sidebar';
import * as api from '@/lib/api';
import { Message, Document, Chat } from '@/types';
import { useToasts } from '@/lib/hooks/use-toasts';
import { Bot, FileText, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatViewProps {
  chatId?: string;
  initialMessages?: Message[];
  initialDocuments?: Document[];
  initialChatDetails?: Chat;
  initialChats: Chat[];
}

export function ChatView({ chatId: initialChatId, initialMessages = [], initialDocuments = [], initialChatDetails, initialChats }: ChatViewProps) {
  const router = useRouter();
  const { addToast } = useToasts();
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chatDetails, setChatDetails] = useState<Chat | undefined>(initialChatDetails);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  
  const [isSending, setIsSending] = useState(false);
  
  // UI State
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [chatId]);

  const ensureChatExists = async (): Promise<string | null> => {
    if (chatId) return chatId;
    try {
        const newChat = await api.createNewChat();
        setChatId(newChat.id);
        setChatDetails(newChat);
        router.replace(`/c/${newChat.id}`, { scroll: false });
        return newChat.id;
    } catch (error) {
        addToast('error', 'Failed to create new chat');
        return null;
    }
  };

  const handleSendMessage = async (inputText: string) => {
    setIsSending(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const currentChatId = await ensureChatExists();
    if (!currentChatId) {
        setIsSending(false);
        setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        return;
    }

    try {
      const botResponse = await api.sendMessageToChat(currentChatId, inputText);
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

    const currentChatId = await ensureChatExists();
    if (!currentChatId) {
        setIsUploading(false);
        return;
    }

    try {
        await api.uploadFile(currentChatId, file, (progress) => console.log(progress));
        addToast('success', 'Upload complete!', `${file.name} is ready.`);
        // Refresh documents and chat details
        const [updatedDocs, chats] = await Promise.all([
          api.getChatDocs(currentChatId),
          api.getChats()
        ]);
        setDocuments(updatedDocs);
        setChatDetails(chats.find(c => c.id === currentChatId) || null);
    } catch (error) {
        addToast('error', 'Upload failed', (error as Error).message);
    } finally {
        setIsUploading(false);
    }
  };
  
  const handleDeleteDoc = async (docName: string) => {
    if(!window.confirm(`Are you sure you want to remove "${docName}"?`)) return;
    if (!chatId) return;
    try {
        await api.deleteDoc(chatId, docName);
        addToast('success', 'Document removed');
        setDocuments(prev => prev.filter(d => d.name !== docName));
    } catch (error) {
        addToast('error', 'Failed to remove document', (error as Error).message);
    }
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar initialChats={initialChats} isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
      <main className="flex flex-col h-full bg-background flex-1">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b p-3 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileSidebarOpen(true)}><Menu size={20} /></Button>
              <div className="w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <Bot size={20} />
              </div>
            <h1 className="font-semibold text-foreground truncate">{chatDetails?.title || 'New Chat'}</h1>
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
      </main>
    </div>
  );
}
