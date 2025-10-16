import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '@/lib/api';
import { Chat } from '@/types';
import { RootState } from './store';

export interface ChatListState {
  chats: Chat[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ChatListState = {
  chats: [],
  status: 'idle',
  error: null,
};

// Async Thunks
export const fetchChats = createAsyncThunk('chats/fetchChats', async () => {
  return await api.getChats();
});

export const createNewChat = createAsyncThunk('chats/createNewChat', async (_, { rejectWithValue }) => {
    try {
        return await api.createNewChat();
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const deleteChat = createAsyncThunk('chats/deleteChat', async (chatId: string, { rejectWithValue }) => {
    try {
        await api.deleteChat(chatId);
        return chatId;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const renameChat = createAsyncThunk('chats/renameChat', async ({ chatId, newTitle }: { chatId: string; newTitle: string }, { rejectWithValue }) => {
    try {
        await api.renameChat(chatId, newTitle);
        return { chatId, newTitle };
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});


const chatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setInitialChats: (state, action: PayloadAction<Chat[]>) => {
      // Hydrate the store with server-fetched chats.
      // Only do this if the chat list is empty to avoid overwriting client state on navigation.
      if (state.chats.length === 0) {
        state.chats = action.payload;
        state.status = 'succeeded';
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchChats
      .addCase(fetchChats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      // createNewChat
      .addCase(createNewChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
      })
      // deleteChat
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.chats = state.chats.filter(c => c.id !== action.payload);
      })
      // renameChat
      .addCase(renameChat.fulfilled, (state, action) => {
          const { chatId, newTitle } = action.payload;
          const chatToUpdate = state.chats.find(c => c.id === chatId);
          if (chatToUpdate) {
              chatToUpdate.title = newTitle;
          }
      });
  },
});

export const { setInitialChats } = chatSlice.actions;

export const selectAllChats = (state: RootState) => state.chats.chats;
export const selectChatsStatus = (state: RootState) => state.chats.status;

export default chatSlice.reducer;
