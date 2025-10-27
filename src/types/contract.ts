import { Document, ProcessingDocument } from ".";

// /chats/{chatId}/docs-sse
export interface DocsSSEMessage {
  pdfs: Document[];
  xslx: Document[];
  processing: ProcessingDocument[];
  total_docs: number;
  chat_id: string;
}
