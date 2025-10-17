/**
 * @file Centralized API client for all frontend-to-backend communication.
 * This abstracts away the fetch logic, making components cleaner and easier to manage.
 */

import { Chat, Message, Document, SourceReference } from '@/types';

// The base URL for your backend API.
const API_BASE = 'http://3.6.93.207:5000/api';
// const API_BASE = 'http://localhost:5050/api'

/**
 * A helper function to handle API responses.
 * It parses the JSON and throws an error if the response is not 'ok'.
 * @param response The raw Response object from fetch.
 * @returns The parsed JSON data.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    // Handle cases with no content
    if (response.status === 204) {
      return null as T;
    }
    return response.json();
  } else {
    const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
}

// --- CHAT-RELATED API CALLS ---

export const getChats = async (): Promise<Chat[]> => {
  const response = await fetch(`${API_BASE}/chats`);
  return handleResponse<Chat[]>(response);
};

export const createNewChat = async (): Promise<Chat> => {
  const response = await fetch(`${API_BASE}/chats`, { method: 'POST' });
  return handleResponse<Chat>(response);
};

export const deleteChat = async (chatId: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/chats/${chatId}`, { method: 'DELETE' });
  await handleResponse(response);
};

export const renameChat = async (chatId: string, newTitle: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/chats/${chatId}/rename`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle }),
  });
  await handleResponse(response);
};

// --- MESSAGE-RELATED API CALLS ---

export const getMessagesForChat = async (chatId: string): Promise<Message[]> => {
  const response = await fetch(`${API_BASE}/chats/${chatId}`);
  return handleResponse<Message[]>(response);
};

export const sendMessageToChat = async (chatId: string, message: string): Promise<Message> => {
  const response = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  // The backend returns a different structure for a bot's reply.
  // We need to adapt it to our standard `Message` type.
  interface BotResponse {
    reply: string;
    sources: SourceReference[];
  }

  const botResponse = await handleResponse<BotResponse>(response);

  const botMessage: Message = {
    id: `msg_${Date.now()}`,
    text: botResponse.reply,
    sender: 'bot',
    timestamp: new Date().toISOString(),
    hasContext: botResponse.sources && botResponse.sources.length > 0,
    sourceReferences: botResponse.sources,
  };

  return botMessage;
};

// --- DOCUMENT-RELATED API CALLS ---

export const getChatDocs = async (chatId: string): Promise<Document[]> => {
    try {
        const response = await fetch(`${API_BASE}/chats/${chatId}/pdfs`);
        const data = await handleResponse<{pdfs: Document[]}>(response);
        return data.pdfs || [];
    } catch (error) {
        console.warn('Could not fetch documents, maybe none exist for this chat.', error);
        return []; // Return empty array if the endpoint fails (e.g., 404)
    }
};


export const uploadFile = async (chatId: string, file: File, onProgress: (progress: number) => void): Promise<any> => {
  // This is a simplified version. For actual progress, you would need
  // to use XMLHttpRequest or a library that supports upload progress with fetch.
  // Here, we'll just simulate progress.
  
  onProgress(10);
  const formData = new FormData();
  formData.append('pdf', file);
  onProgress(30);

  const response = await fetch(`${API_BASE}/chats/${chatId}/upload-pdf`, {
    method: 'POST',
    body: formData,
  });

  onProgress(100);
  return handleResponse(response);
};

export const deleteDoc = async (chatId: string, docName: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/chats/${chatId}/pdfs/${encodeURIComponent(docName)}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
};

