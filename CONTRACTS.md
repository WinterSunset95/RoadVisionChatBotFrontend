# Application Contracts

This document outlines the API contracts, component props, and custom hooks used throughout the application.

## 1. API Data Structures

These are the primary data structures used when communicating with the backend API.

### Chat

Represents a single conversation thread.

-   `id: string` - Unique identifier for the chat.
-   `title: string` - The title of the chat.
-   `created_at: string` - ISO 8601 timestamp of creation.
-   `updated_at: string` - ISO 8601 timestamp of the last update.
-   `message_count: number` - Total number of messages in the chat.
-   `has_pdf: boolean` - True if the chat has associated documents.
-   `pdf_count?: number` - (Optional) The number of PDFs associated with the chat.

### Message

Represents a single message within a chat.

-   `id: string` - Unique identifier for the message.
-   `text: string` - The content of the message in Markdown format.
-   `sender: 'user' | 'bot'` - Who sent the message.
-   `timestamp: string` - ISO 8601 timestamp of when the message was sent.
-   `isError?: boolean` - (Optional) True if the message represents an error.
-   `hasContext?: boolean` - (Optional) True if the bot's message was generated using document context.
-   `sourceReferences?: SourceReference[]` - (Optional) A list of sources used to generate the bot's response.

### SourceReference

Represents a specific citation from a source document.

-   `id: number` - Unique identifier for the reference.
-   `page: number` - The page number in the source document.
-   `type: string` - The type of source (e.g., 'pdf').
-   `content: string` - The quoted text snippet from the source.
-   `source: string` - The name of the source file (e.g., 'document.pdf').

### Document

Represents an uploaded document associated with a chat.

-   `name: string` - The filename of the document.
-   `chunks: number` - The number of indexed sections the document has been split into.
-   `status: 'active' | 'inactive'` - The processing status of the document.

---

## 2. Component Contracts

This section details the props for each major React component.

### `ChatView`

The main component that orchestrates the entire chat interface. It can handle both new and existing chats.

-   `chatId?: string` - The ID of the chat to display. If omitted, the view will start a new chat on the first user interaction.
-   `initialMessages?: Message[]` - An array of `Message` objects to prepopulate the chat. Defaults to `[]`.
-   `initialDocuments?: Document[]` - An array of `Document` objects associated with the chat. Defaults to `[]`.
-   `initialChatDetails?: Chat` - The `Chat` object for the current conversation.
-   `initialChats: Chat[]` - The initial list of all user's chats for the sidebar.

### `Sidebar`

The sidebar component that displays the chat history and navigation controls.

-   `initialChats: Chat[]` - The initial list of `Chat` objects to display.
-   `isMobileOpen: boolean` - Controls the visibility of the sidebar overlay on mobile screens.
-   `onMobileClose: () => void` - Callback function to close the mobile sidebar overlay.
-   `isCollapsed: boolean` - Controls the collapsed state of the sidebar on desktop screens.

### `ChatHistory`

Displays the list of past conversations within the `Sidebar`.

-   `chats: Chat[]` - The list of chats to render.
-   `activeChatId: string` - The ID of the currently active chat to highlight it.
-   `editingChatId: string | null` - The ID of the chat currently being renamed.
-   `editTitle: string` - The current value of the input for renaming a chat.
-   `onEditChange: (title: string) => void` - Callback for when the rename input value changes.
-   `onStartEdit: (chat: Chat) => void` - Callback to initiate renaming a chat.
-   `onCancelEdit: () => void` - Callback to cancel renaming.
-   `onSaveEdit: (chatId: string) => void` - Callback to save the new chat title.
-   `onDelete: (chatId: string) => void` - Callback to delete a chat.

### `ChatInput`

The user input component for sending messages and uploading files.

-   `onSendMessage: (message: string) => void` - Callback function executed when the user sends a message.
-   `onFileUpload: (file: File) => void` - Callback function executed when the user uploads a file.
-   `disabled: boolean` - Disables the input, send, and upload buttons.
-   `isUploading: boolean` - Shows a loading state on the upload button.

### `MessageList`

Renders the scrollable list of messages.

-   `messages: Message[]` - An array of `Message` objects to display.
-   `isLoading: boolean` - If true, displays the "AI is thinking..." indicator.

### `MessageBubble`

Renders a single message bubble.

-   `message: Message` - The `Message` object to render.

### `DocumentPanel`

A panel that displays documents associated with a chat.

-   `docs: Document[]` - An array of `Document` objects to display.
-   `isLoading: boolean` - If true, shows a loading state.
-   `onClose: () => void` - Callback to close the panel.
-   `onDelete: (docName: string) => void` - Callback to delete a document.

---

## 3. Custom Hooks

### `useToasts`

A hook for displaying toast notifications.

#### Return Value

-   `addToast(type: ToastType, title: string, message?: string): void` - A function to add a new toast.
    -   `type: 'success' | 'error' | 'info' | 'warning' | 'default'`
    -   `title: string` - The main title of the toast.
    -   `message?: string` - (Optional) Additional descriptive text for the toast.
