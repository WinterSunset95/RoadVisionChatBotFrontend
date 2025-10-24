import { Loader } from "lucide-react";

/**
 * The UI to show while the chat is being created on the server.
 */
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
      <h1 className="text-xl font-semibold">Creating your new chat from Google Drive...</h1>
      <p className="text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}

