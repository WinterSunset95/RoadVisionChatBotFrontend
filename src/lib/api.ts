/**
 * @file Centralized API client for all frontend-to-backend communication.
 * This abstracts away the fetch logic, making components cleaner and easier to manage.
 */

import { Chat, Message, Document, SourceReference, ProcessingDocument } from '@/types';

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

export const sendMessageToChat = async (chatId: string, message: string): Promise<{ botMessage: Message, messageCount: number }> => {
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
    message_count: number;
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

  return { botMessage, messageCount: botResponse.message_count };
};

// --- DOCUMENT-RELATED API CALLS ---

export const getChatDocs = async (chatId: string): Promise<{ documents: Document[], processing: ProcessingDocument[] }> => {
    try {
        const response = await fetch(`${API_BASE}/chats/${chatId}/docs`);
        const data = await handleResponse<any>(response);
        if (!data) return { documents: [], processing: [] };

        const documents: Document[] = [];
        if (data.pdfs) documents.push(...data.pdfs);
        if (data.xslx) documents.push(...data.xslx);

        const processing: ProcessingDocument[] = data.processing ? data.processing.map((p: any) => ({
            name: p.name,
            jobId: p.job_id,
            status: p.status,
        })) : [];

        return { documents, processing };
    } catch (error) {
        console.warn('Could not fetch documents, maybe none exist for this chat.', error);
        return { documents: [], processing: [] };
    }
};


export interface UploadResponse {
  message: string;
  job_id: string;
  processing: boolean;
}

export const uploadFile = async (chatId: string, file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await fetch(`${API_BASE}/chats/${chatId}/upload-pdf`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<UploadResponse>(response);
};

export interface UploadStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  started_at?: string;
  finished_at?: string;
  chunks_added?: number;
}

export const getUploadStatus = async (jobId: string): Promise<UploadStatus> => {
  const response = await fetch(`${API_BASE}/upload-status/${jobId}`);
  return handleResponse<UploadStatus>(response);
};

export const deleteDoc = async (chatId: string, docName: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/chats/${chatId}/pdfs/${encodeURIComponent(docName)}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
};

