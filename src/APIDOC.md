# Chatbot API Documentation

This document provides a comprehensive overview of the API endpoints used by the chatbot frontend, reflecting the current server implementation.

**Base URL:** `http://3.6.93.207:5000/api`

---

## 1. System Endpoints

### 1.1 Health Check

Checks the operational status of the server.

-   **Endpoint:** `/health`
-   **Method:** `GET`
-   **Success Response (200 OK):**
    ```json
    {
      "status": "healthy",
      "timestamp": "2025-10-17T14:26:00.123Z",
      "llamaparse": "available"
    }
    
---

## 2. Chat Management (`/chats`)

This resource is for managing entire chat conversations.

### 2.1 Get All Chats

Retrieves a list of all existing chat conversations, sorted by the most recently updated.

-   **Endpoint:** `/chats`
-   **Method:** `GET`
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
        "pdf_count": 2,
        "pdf_list": [
            {
                "name": "report.pdf",
                "upload_time": "2025-10-17T11:25:00Z",
                "chunks_added": 150,
                "status": "active"
            }
        ]
      }
    ]
    
### 2.2 Create a New Chat

Creates a new, empty chat conversation.

-   **Endpoint:** `/chats`
-   **Method:** `POST`
-   **Success Response (201 Created):**
    -   A single chat object for the new conversation.
    ```json
    {
      "id": "chat_67890",
      "title": "New Chat 1",
      "created_at": "2025-10-17T11:34:00Z",
      "updated_at": "2025-10-17T11:34:00Z",
      "message_count": 0,
      "has_pdf": false,
      "pdf_count": 0,
      "pdf_list": []
    }
    
### 2.3 Get a Single Chat's Messages

Retrieves the historical messages for a specific chat. **Note:** This endpoint provides a simplified history and does not include source references for past messages.

-   **Endpoint:** `/chats/{chatId}`
-   **Method:** `GET`
-   **URL Parameters:**
    -   `chatId` (string, required): The unique identifier of the chat.
-   **Success Response (200 OK):**
    -   An array of simplified message objects.
    ```json
    [
      {
        "id": "msg_1",
        "text": "Hello, how can I help you?",
        "sender": "bot",
        "timestamp": "2025-10-17T11:35:00Z"
      }
    ]
    
### 2.4 Delete a Chat

Permanently deletes a chat, its message history, and its associated vector collection.

-   **Endpoint:** `/chats/{chatId}`
-   **Method:** `DELETE`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat to delete.
-   **Success Response (200 OK):**
    ```json
    {
      "message": "Chat deleted successfully"
    }
    
### 2.5 Rename a Chat

Updates the title of a specific chat.

-   **Endpoint:** `/chats/{chatId}/rename`
-   **Method:** `PUT`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat to rename.
-   **Request Body:**
    ```json
    {
      "title": "Updated Chat Title"
    }
    -   **Success Response (200 OK):**
    ```json
    {
      "message": "Chat renamed successfully"
    }
    
---

## 3. Message Management

### 3.1 Send a Message

Sends a user message to a chat and gets a contextual AI response.

-   **Endpoint:** `/chats/{chatId}/messages`
-   **Method:** `POST`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat.
-   **Request Body:**
    ```json
    {
      "message": "What were the Q3 earnings?"
    }
    -   **Success Response (200 OK):**
    -   A bot message object, which includes detailed source references if context was used.
    ```json
    {
      "reply": "The Q3 earnings were $5 million, as stated on Page 5 of the quarterly-report.pdf.",
      "sources": [
        {
          "id": 1,
          "source": "quarterly-report.pdf",
          "location": "Page 5",
          "doc_type": "pdf",
          "content_type": "text",
          "content": "In the third quarter, the company saw earnings of $5 million...",
          "full_content": "...",
          "page": "5"
        }
      ],
      "message_count": 13
    }
    
---

## 4. Document & Upload Management

### 4.1 Upload a PDF (Asynchronous)

Initiates the upload and processing of a PDF file. This is an asynchronous operation.

-   **Endpoint:** `/chats/{chatId}/upload-pdf`
-   **Method:** `POST`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat.
-   **Request Body:**
    -   `multipart/form-data` with the file under the key `pdf`.
-   **Success Response (202 Accepted):**
    -   A job ID is returned. The client must poll the `/upload-status/{job_id}` endpoint to track completion.
    ```json
    {
      "message": "Upload accepted",
      "job_id": "job_uuid_12345",
      "processing": true
    }
    
### 4.2 Get Upload Status

Checks the status of a background file processing job.

-   **Endpoint:** `/upload-status/{job_id}`
-   **Method:** `GET`
-   **URL Parameters:**
    -   `job_id` (string, required): The ID returned from the upload endpoint.
-   **Success Response (200 OK):**
    -   A status object. The `status` will be `queued`, `processing`, `done`, or `error`.
    ```json
    {
        "job_id": "job_uuid_12345",
        "status": "done",
        "started_at": "2025-10-17T14:30:00Z",
        "finished_at": "2025-10-17T14:30:45Z",
        "chunks_added": 150
    }
    
### 4.3 Get Documents for a Specific Chat

Retrieves a list of all PDF documents uploaded to a single chat.

-   **Endpoint:** `/chats/{chatId}/pdfs`
-   **Method:** `GET`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat.
-   **Success Response (200 OK):**
    ```json
    {
      "pdfs": [
        {
          "name": "annual-report-2025.pdf",
          "chunks": 152,
          "status": "active"
        }
      ],
      "total_pdfs": 1,
      "chat_id": "chat_12345"
    }

(version 2)
-   **Endpoint:** `/chats/{chatId}/docs`
-   **Method:** `GET`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat.
-   **Success Response (200 OK):**
    ```json
    {
      "pdfs": [
        {
          "name": "annual-report-2025.pdf",
          "chunks": 152,
          "status": "active"
        }
      ],
      "xslx": [
        {
          "name": "annual-report-2025.xls",
          "chunks": 152,
          "status": "active"
        }
      ],
      "processing": [
        {
            "name": "annual-report-2025.pdf",
            "job_id": "job_uuid_12345",
            "status": "processing" | "queued"
        }
      ],
      "total_docs": 1,
      "chat_id": "chat_12345"
    }
    
### 4.4 Get All Documents Across All Chats

Retrieves a master list of all PDFs that have been uploaded to any chat.

-   **Endpoint:** `/pdfs`
-   **Method:** `GET`
-   **Success Response (200 OK):**
    ```json
    {
      "pdfs": [
          {
              "chat_id": "chat_12345",
              "chat_title": "My First Chat",
              "name": "annual-report.pdf",
              "chunks": 152,
              "status": "active",
              "uploaded_at": "2025-10-17T14:30:00Z"
          }
      ],
      "total_pdfs": 1
    }
    
### 4.5 Delete a PDF from a Chat

Removes a specific PDF from a chat and its associated data from the vector store.

-   **Endpoint:** `/chats/{chatId}/pdfs/{pdf_name}`
-   **Method:** `DELETE`
-   **URL Parameters:**
    -   `chatId` (string, required): The ID of the chat.
    -   `pdf_name` (string, required): The URL-encoded filename to delete.
-   **Success Response (200 OK):**
    ```json
    {
        "message": "PDF removed successfully",
        "chat_id": "chat_12345",
        "pdf_name": "annual-report.pdf"
    }
    ```
