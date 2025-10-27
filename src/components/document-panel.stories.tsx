import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DocumentPanel } from './document-panel';

const meta = {
  component: DocumentPanel,
} satisfies Meta<typeof DocumentPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    docs: [
      {
        "name": "BCANEW1JD25.pdf",
        "chunks": 2,
        "status": "active"
      },
      {
        "name": "BCA_NEW_Semester_1_Assignment.pdf",
        "chunks": 26,
        "status": "active"
      },
      {
        "name": "BCANEW1JD25BL.pdf",
        "chunks": 58,
        "status": "active"
      },
      {
        "name": "BCA_NEW_July_2024_Programme_Guide.pdf",
        "chunks": 98,
        "status": "active"
      }
    ],
    processingDocs: [
      {
        "name": "BCANEW1JD25.pdf",
        "job_id": "random-job-id",
        "status": "processing",
        "stage": "extracting_content",
        "progress": 50
      },
    ],
    isLoading: false,
    onClose: () => {},
    onDelete: () => {},
    showDocPanel: true
  }
};

export const Closed: Story = {
  args: {
    docs: [
      {
        "name": "BCANEW1JD25.pdf",
        "chunks": 2,
        "status": "active"
      },
      {
        "name": "BCA_NEW_Semester_1_Assignment.pdf",
        "chunks": 26,
        "status": "active"
      },
      {
        "name": "BCANEW1JD25BL.pdf",
        "chunks": 58,
        "status": "active"
      },
      {
        "name": "BCA_NEW_July_2024_Programme_Guide.pdf",
        "chunks": 98,
        "status": "active"
      }
    ],
    processingDocs: [],
    isLoading: false,
    onClose: () => {},
    onDelete: () => {},
    showDocPanel: false
  }
};
