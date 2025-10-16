// A simple in-memory store for transferring state across page loads in the client.
interface AppState {
  pendingMessage: string | null;
}

const clientState: AppState = {
  pendingMessage: null,
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
};
