import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NewFromDrivePage } from './NewFromDrivePage';
import { Loader } from "lucide-react";

const meta = {
  component: NewFromDrivePage,
} satisfies Meta<typeof NewFromDrivePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    driveUrl: undefined,
    chatDocs: undefined
  }
};

export const InvalidLink: Story = {
  args: {
    driveUrl: null,
    chatDocs: undefined
  }
}

export const FileDownloading: Story = {
  args: {
    driveUrl: "random_url",
    chatDocs: undefined,
  }
}

export const FileProcessing: Story = {
  args: {
    driveUrl: "random_url",
    chatDocs: {
      documents: [],
      processing: [
        { job_id: "test-id", name: "newfile_1.pdf", status: "processing", stage: "tesseract_loading", progress: 50 },
        { job_id: "test-id2", name: "newfile_2.pdf", status: "processing", stage: "tesseract_loading", progress: 50 }
      ]
    },
  }
}
