/**
 * @file The dynamic page for displaying a single chat conversation.
 * It fetches initial data on the server and passes it to the client component.
 */
import { ChatView } from '@/components/chat-view';
import { getMessagesForChat, getChatDocs, getChats } from '@/lib/api';
import { notFound } from 'next/navigation';

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  try {
    // Fetch initial data in parallel on the server
    const [initialMessages, initialDocuments, chats] = await Promise.all([
      getMessagesForChat(params.chatId),
      getChatDocs(params.chatId),
      getChats()
    ]);

    const chatDetails = chats.find(c => c.id === params.chatId);
    if (!chatDetails) {
      notFound();
    }

    return (
      <ChatView
        chatId={params.chatId}
        initialMessages={initialMessages}
        initialDocuments={initialDocuments}
        initialChatDetails={chatDetails}
        initialChats={chats}
      />
    );
  } catch (error) {
    console.error(`Failed to load data for chat ${params.chatId}`, error);
    // notFound() will render the nearest not-found.js file
    notFound();
  }
}
