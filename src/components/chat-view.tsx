/**
 * @file Main client component that orchestrates the entire chat interface.
 * It receives initial data as props and handles all user interactions.
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/lib/store';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { fetchChats, updateChatDetails } from '@/lib/redux/chatSlice';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';
import { DocumentPanel } from '@/components/document-panel';
import { Sidebar } from '@/components/sidebar';
import * as api from '@/lib/api';
import { Message, Document, Chat } from '@/types';
import { useToasts } from '@/lib/hooks/use-toasts';
import { Bot, FileText, LayoutPanelLeft, Menu } from 'lucide-react';
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
  const dispatch: AppDispatch = useDispatch();
  const { addToast } = useToasts();
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chatDetails, setChatDetails] = useState<Chat | undefined>(initialChatDetails);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  
  const [isSending, setIsSending] = useState(false);
  
  // UI State
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // For the actual upload POST
  const [processingDocs, setProcessingDocs] = useState<{ jobId: string; name: string }[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (chatId) {
      const pendingMessage = store.getPendingMessage();
      if (pendingMessage) {
        handleSendMessage(pendingMessage);
      }
      const pendingFile = store.getPendingFile();
      if (pendingFile) {
        handleFileUpload(pendingFile);
      }
    }
    // We only want this to run once on mount when a chatID is first available.
    // The store clears the message/file, so subsequent runs won't do anything.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [chatId]);

  const handleSendMessage = async (inputText: string) => {
    if (!chatId) {
      // This is a new chat. Create it, store the message, and navigate.
      // The new page will handle sending the message.
      setIsSending(true);
      try {
        const newChat = await api.createNewChat();
        store.setPendingMessage(inputText);
        router.push(`/c/${newChat.id}`);
      } catch (error) {
        addToast('error', 'Failed to create new chat');
        setIsSending(false);
      }
      return;
    }

    // This is an existing chat.
    setIsSending(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const { botMessage, messageCount } = await api.sendMessageToChat(chatId, inputText);
      console.log(botMessage);
      setMessages((prev) => [...prev, botMessage]);
      dispatch(updateChatDetails({ chatId: chatId!, messageCount }));
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

    let currentChatId = chatId;

    // If this is a new chat, create it, store the file, and navigate.
    // The new page will handle the actual upload.
    if (!currentChatId) {
      try {
        const newChat = await api.createNewChat();
        store.setPendingFile(file);
        router.push(`/c/${newChat.id}`);
      } catch (error) {
        addToast('error', 'Failed to create new chat');
      }
      return;
    }
    
    setIsUploading(true);
    addToast('info', 'Uploading document...', file.name);

    try {
      const { job_id } = await api.uploadFile(currentChatId, file);
      setIsUploading(false); // Unblock input
      addToast('info', 'Processing document...', 'This may take a moment.');
      setProcessingDocs(prev => [...prev, { jobId: job_id, name: file.name }]);

      const pollStatus = async () => {
        try {
          const status = await api.getUploadStatus(job_id);
          if (status.status === 'done') {
            addToast('success', 'Processing complete!', `${file.name} is ready.`);
            setProcessingDocs(prev => prev.filter(doc => doc.jobId !== job_id));
            
            if (!chatId) {
              router.push(`/c/${currentChatId!}`);
            } else {
              // Refetch chats to update sidebar and get new document list
              const chats = await dispatch(fetchChats()).unwrap();
              const updatedChatDetails = chats.find(c => c.id === currentChatId);

              if (updatedChatDetails?.pdf_list) {
                // If the chat list contains our doc info, use it.
                const updatedDocs: Document[] = updatedChatDetails.pdf_list.map(pdf => ({
                  name: pdf.name,
                  chunks: pdf.chunks_added, // APIDOC says GET /chats returns chunks_added
                  status: pdf.status,
                }));
                setDocuments(updatedDocs);
              } else {
                // Fallback to fetching docs directly if not in chat list
                const updatedDocs = await api.getChatDocs(currentChatId!);
                setDocuments(updatedDocs);
              }
              setChatDetails(updatedChatDetails || undefined);
            }
          } else if (status.status === 'error') {
            addToast('error', 'Processing failed', 'Could not process the document.');
            setProcessingDocs(prev => prev.filter(doc => doc.jobId !== job_id));
          } else {
            // still processing, poll again in 2 seconds
            setTimeout(pollStatus, 2000);
          }
        } catch (error) {
          addToast('error', 'Failed to get upload status', (error as Error).message);
          setProcessingDocs(prev => prev.filter(doc => doc.jobId !== job_id));
        }
      };
      setTimeout(pollStatus, 2000); // Start polling

    } catch (error) {
      addToast('error', 'Upload failed', (error as Error).message);
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
      <Sidebar initialChats={initialChats} isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} isCollapsed={isSidebarCollapsed} />
      <main className="flex flex-col h-full bg-background flex-1">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b p-3 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setIsMobileSidebarOpen(true)}><LayoutPanelLeft size={20} /></Button>
              <Button variant="outline" size="icon" className="hidden lg:flex" onClick={() => setIsSidebarCollapsed(prev => !prev)}><LayoutPanelLeft size={20} /></Button>
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
      
      <DocumentPanel docs={documents} processingDocs={processingDocs} isLoading={false} onClose={() => setShowDocPanel(false)} onDelete={handleDeleteDoc} showDocPanel={showDocPanel} />

      <MessageList messages={messages} isLoading={isSending} onSendMessage={handleSendMessage} />
      <ChatInput onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} disabled={isSending || isUploading} isUploading={isUploading} />
      </main>
    </div>
  );
}
