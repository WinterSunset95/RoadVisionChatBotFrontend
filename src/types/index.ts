/**
 * @file This file contains all the core TypeScript types used throughout the application.
 * Centralizing types helps ensure data consistency and improves code clarity.
 */

/**
 * Represents a single chat conversation, typically displayed in the sidebar.
 */
/**
 * Represents a PDF document as returned within a Chat object from the GET /chats endpoint.
 */
export interface PdfInChatList {
    name: string;
    upload_time: string;
    chunks_added: number;
    status: 'active' | 'inactive';
}

export interface Chat {
    id: string;
    title: string;
    updated_at: string;
    message_count: number;
    has_pdf: boolean;
    pdf_count?: number;
    pdf_list?: PdfInChatList[];
}

/**
 * Represents a single message within a chat conversation.
 */
export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: string;
    isError?: boolean;
    hasContext?: boolean;
    sourceReferences?: SourceReference[];
}

/**
 * Represents a source reference cited in a bot's message,
 * typically derived from an uploaded document.
 */
export interface SourceReference {
    id: number;
    source: string;
    location?: string;
    doc_type: string;
    content_type: string;
    content: string;
    full_content?: string;
    page: string;
}

/**
 * Represents an uploaded document associated with a chat.
 */
export interface Document {
    name: string;
    chunks: number;
    status: 'active' | 'inactive';
}

/**
 * Represents the structure of a toast notification.
 */
export type Toast = {
    id: number;
    type: 'success' | 'error' | 'info' | 'uploading';
    title: string;
    message?: string;
};
