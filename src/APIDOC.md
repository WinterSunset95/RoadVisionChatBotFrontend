# Chatbot API Documentation

This document provides a comprehensive overview of the API endpoints used by the chatbot frontend.

**Base URL:** `http://3.6.93.207:5000/api`

---

## 1. Chat Management (`/chats`)

This resource is used for managing chat conversations.

### 1.1 Get All Chats

Retrieves a list of all existing chat conversations.

-   **Endpoint:** `/chats`
-   **Method:** `GET`
-   **Request Body:** None
-   **Success Response (200 OK):**
    -   An array of chat objects.
    ```json
    [
      {
        "id": "chat_12345",
        "title": "My First Chat",
        "updated_at": "2025-10-17T11:30:00Z",
        "message_count": 12,
        "has_pdf": true,
        "pdf_count": 2
      },
      ...
    ]
    ```

### 1.2 Create a New Chat

Creates a new, empty chat conversation.

-   **Endpoint:** `/chats`
-   **Method:** `POST`
-   **Request Body:** None
-   **Success Response (200 OK / 201 Created):**
    -   A single chat object representing the newly created conversation.
    ```json
    {
      "id": "chat_67890",
      "title": "New Chat",
      "updated_at": "2025-10-17T11:34:00Z",
      "message_count": 0,
      "has_pdf": false,
      "pdf_count": 0
    }
    ```

### 1.3 Get a Single Chat's Messages

Retrieves the complete message history for a specific chat.

-   **Endpoint:** `/chats/{chatId}`
-   **Method:** `GET`
-   **URL Parameters:**
    -   `chatId` (string, required): The unique identifier of the chat.
-   **Success Response (200 OK):**
    -   An array of message objects.
    ```json
    [
        {
            "id": "msg_1",
            "text": "Hello, how can I help you?",
            "sender": "bot",
            "timestamp": "2025-10-17T11:35:00Z",
            "hasContext": false,
            "sourceReferences": []
        }
    ]
    ```

### 1.4 Delete a Chat

Permanently deletes an entire chat conversation and its associated data.

-   **Endpoint:** `/chats/{chatId}`
-   **Method:** `DELETE`
-   **URL Parameters:**
    -   `chatId` (string, required): The unique identifier of the chat to delete.
-   **Success Response (200 OK / 204 No Content):**
    -   An empty body confirming the deletion.

### 1.5 Rename a Chat

Updates the title of a specific chat conversation.

-   **Endpoint:** `/chats/{chatId}/rename`
-   **Method:** `PUT`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat to rename.
-   **Request Body:**
    -   A JSON object with the new title.
    ```json
    {
      "title": "Updated Chat Title"
    }
    ```
-   **Success Response (200 OK):**
    -   An empty body or the updated chat object.

---

## 2. Message Management (`/messages`)

This resource is used for sending and receiving messages within a chat.

### 2.1 Send a Message

Sends a user's message to a conversation and receives the AI's response.

-   **Endpoint:** `/chats/{chatId}/messages`
-   **Method:** `POST`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat to send the message to.
-   **Request Body:**
    -   A JSON object containing the user's message.
    ```json
    {
      "message": "What is the capital of India?"
    }
    ```
-   **Success Response (200 OK):**
    -   A single bot message object, which may include source references if documents were used.
    ```json
    {
      "reply": "The capital of India is New Delhi.",
      "sources": [
        {
          "id": 1,
          "page": 5,
          "type": "text",
          "content": "New Delhi, the capital of India, is located in the northern part of the country.",
          "source": "geography-facts.pdf"
        }
      ]
    }
    ```

---

## 3. Document Management (`/pdfs`)

This resource is used for handling PDF documents associated with a chat.

### 3.1 Get Chat Documents

Retrieves a list of all PDF documents that have been uploaded to a specific chat.

-   **Endpoint:** `/chats/{chatId}/pdfs`
-   **Method:** `GET`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat.
-   **Success Response (200 OK):**
    -   A JSON object containing an array of document objects.
    ```json
    {
      "pdfs": [
        {
          "name": "annual-report-2025.pdf",
          "chunks": 152,
          "status": "active"
        }
      ]
    }
    ```

### 3.2 Upload a PDF

Uploads a PDF file to a chat, where it will be processed and indexed for context.

-   **Endpoint:** `/chats/{chatId}/upload-pdf`
-   **Method:** `POST`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat to associate the document with.
-   **Request Body:**
    -   `multipart/form-data` containing the PDF file under the key `pdf`.
-   **Success Response (200 OK):**
    -   A JSON object confirming the successful upload.
    ```json
    {
      "message": "File uploaded and processed successfully.",
      "filename": "annual-report-2025.pdf"
    }
    ```

### 3.3 Delete a PDF

Permanently removes a specific PDF document from a chat.

-   **Endpoint:** `/chats/{chatId}/pdfs/{docName}`
-   **Method:** `DELETE`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat.
    -   `docName` (string, required): The URL-encoded filename of the document to delete.
-   **Success Response (200 OK / 204 No Content):**
    -   An empty body confirming the deletion.
