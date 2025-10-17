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
import { Message, Document, Chat, ProcessingDocument } from '@/types';
import { useToasts } from '@/lib/hooks/use-toasts';
import { Bot, FileText, LayoutPanelLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadProgressOverlay, UploadItem } from '@/components/upload-progress-overlay';

interface ChatViewProps {
  chatId?: string;
  initialMessages?: Message[];
  initialDocuments?: { documents: Document[], processing: ProcessingDocument[] };
  initialChatDetails?: Chat;
  initialChats: Chat[];
}

export function ChatView({ chatId: initialChatId, initialMessages = [], initialDocuments = { documents: [], processing: [] }, initialChatDetails, initialChats }: ChatViewProps) {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { addToast } = useToasts();
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chatDetails, setChatDetails] = useState<Chat | undefined>(initialChatDetails);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments.documents);
  
  const [isSending, setIsSending] = useState(false);
  
  // UI State
  interface UploadTask extends UploadItem {
    xhr: XMLHttpRequest;
  }
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [processingDocs, setProcessingDocs] = useState<ProcessingDocument[]>(initialDocuments.processing);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const uploadIdCounter = useRef(0);

  useEffect(() => {
    if (chatId) {
      const pendingMessage = store.getPendingMessage();
      if (pendingMessage) {
        handleSendMessage(pendingMessage);
      }
      const pendingFiles = store.getPendingFiles();
      if (pendingFiles) {
        handleFileUpload(pendingFiles);
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

  const handleCancelUpload = (id: string) => {
    setUploadTasks((prevTasks) => {
      const taskToCancel = prevTasks.find((task) => task.id === id);
      if (taskToCancel) {
        taskToCancel.xhr.abort();
      }
      return prevTasks.filter((task) => task.id !== id);
    });
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    let currentChatId = chatId;

    if (!currentChatId) {
      try {
        const newChat = await api.createNewChat();
        store.setPendingFiles(files);
        router.push(`/c/${newChat.id}`);
      } catch (error) {
        addToast('error', 'Failed to create new chat');
      }
      return;
    }

    const uploadSingleFile = async (file: File) => {
      const uploadId = `upload_${uploadIdCounter.current++}`;
      const onProgress = (progress: number) => {
        setUploadTasks(prev => prev.map(task => 
            task.id === uploadId ? { ...task, progress } : task
        ));
      };

      const { promise, xhr } = api.uploadFile(currentChatId, file, onProgress);
      setUploadTasks(prev => [...prev, { id: uploadId, file, progress: 0, xhr }]);

      try {
        await promise;
        // Upload is complete, now it's processing.
        addToast('info', `"${file.name}" uploaded, now processing...`);
      } catch (error: any) {
        if (error.message === 'Upload canceled.') {
          addToast('info', `Upload of ${file.name} canceled.`);
        } else {
          addToast('error', `Upload of ${file.name} failed`, error.message);
        }
      } finally {
        // Always remove the task from the upload list when done (success, error, or cancel)
        setUploadTasks(prev => prev.filter(task => task.id !== uploadId));
      }
    }

    const uploadPromises = files.map(file => uploadSingleFile(file));

    await Promise.allSettled(uploadPromises);

    if (chatId) {
      const chats = await dispatch(fetchChats()).unwrap();
      setChatDetails(chats.find(c => c.id === chatId));

      console.log("Finished uploading files, fetching docs...");
      const { documents, processing } = await api.getChatDocs(chatId);
      console.log(documents, processing);
      setDocuments(documents);
      setProcessingDocs(processing);
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

  // Fetch chat details and documents periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (chatId) {
        const chats = await api.getChats();
        const chat = chats.find(c => c.id === chatId);
        setChatDetails(chat);
        const { documents, processing } = await api.getChatDocs(chatId);
        setDocuments(documents);
        setProcessingDocs(processing);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [chatId]);

  return (
    <div className="flex h-screen w-full">
      <UploadProgressOverlay uploads={uploadTasks} onCancel={handleCancelUpload} />
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
            <Button onClick={() => setShowDocPanel(!showDocPanel)} variant="secondary" size="sm" className="gap-2">
                <FileText size={16} /> <span className="hidden sm:inline">Documents</span>
            </Button>
          </div>
        </div>
      </header>
      
      <DocumentPanel docs={documents} processingDocs={processingDocs} isLoading={false} onClose={() => setShowDocPanel(false)} onDelete={handleDeleteDoc} showDocPanel={showDocPanel} />

      <MessageList messages={messages} isLoading={isSending} onSendMessage={handleSendMessage} />
      <ChatInput onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} disabled={isSending || uploadTasks.length > 0} isUploading={uploadTasks.length > 0} />
      </main>
    </div>
  );
}
