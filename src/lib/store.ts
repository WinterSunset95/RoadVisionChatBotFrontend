// A simple in-memory store for transferring state across page loads in the client.
interface AppState {
  pendingMessage: string | null;
  pendingFiles: File[] | null;
}

const clientState: AppState = {
  pendingMessage: null,
  pendingFiles: null,
};

export const store = {
  setPendingMessage: (message: string) => {
    clientState.pendingMessage = message;
  },
  getPendingMessage: (): string | null => {
    const message = clientState.pendingMessage;
    clientState.pendingMessage = null; // Clear after reading
    return message;
  },
  setPendingFiles: (files: File[]) => {
    clientState.pendingFiles = files;
  },
  getPendingFiles: (): File[] | null => {
    const files = clientState.pendingFiles;
    clientState.pendingFiles = null; // Clear after reading
    return files;
  }
};
