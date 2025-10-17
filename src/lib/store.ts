// A simple in-memory store for transferring state across page loads in the client.
interface AppState {
  pendingMessage: string | null;
  pendingFile: File | null;
}

const clientState: AppState = {
  pendingMessage: null,
  pendingFile: null,
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
  setPendingFile: (file: File) => {
    clientState.pendingFile = file;
  },
  getPendingFile: (): File | null => {
    const file = clientState.pendingFile;
    clientState.pendingFile = null; // Clear after reading
    return file;
  }
};
