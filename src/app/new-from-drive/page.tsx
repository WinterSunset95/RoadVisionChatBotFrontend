import { redirect } from 'next/navigation';
import * as api from '@/lib/api';
import { Suspense } from 'react';
import { Loader } from 'lucide-react';

/**
 * An async component that performs the server-side action of creating a chat.
 * While this component is resolving, Next.js will show the Suspense fallback.
 */
async function CreateChatAndRedirect({ driveUrl }: { driveUrl: string }) {
  try {
    const newChat = await api.createNewChat(driveUrl);
    redirect(`/c/${newChat.id}`);
  } catch (error) {
    // If the API call fails, render an error message.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-xl font-semibold mb-4 text-destructive">Error Creating Chat</h1>
        <p className="text-muted-foreground">Could not create a new chat from the provided link.</p>
        <p className="mt-2 text-xs bg-destructive/10 p-2 rounded-md text-destructive-foreground">{(error as Error).message}</p>
      </div>
    );
  }
}

/**
 * The UI to show while the chat is being created on the server.
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
      <h1 className="text-xl font-semibold">Creating your new chat from Google Drive...</h1>
      <p className="text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}

interface NewFromDrivePageProps {
  searchParams: {
    driveUrl?: string;
  };
}

/**
 * The main page component for the /new-from-drive route.
 * It validates the input and uses a Suspense boundary for a better user experience.
 */
export default function NewFromDrivePage({ searchParams }: NewFromDrivePageProps) {
  const { driveUrl } = searchParams;

  if (!driveUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-xl font-semibold mb-4">Invalid Link</h1>
        <p className="text-muted-foreground">No Google Drive URL was provided.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <CreateChatAndRedirect driveUrl={driveUrl} />
    </Suspense>
  );
}
