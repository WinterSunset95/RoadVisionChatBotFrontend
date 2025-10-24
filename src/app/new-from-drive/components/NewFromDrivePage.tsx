import { Document, ProcessingDocument } from "@/types";
import Loading from "../loading";
import { FileText, Loader } from "lucide-react";

export interface NewFromDrivePageProps {
  driveUrl: string | null | undefined
  chatDocs: { documents: Document[]; processing: ProcessingDocument[] } | undefined
}

export function NewFromDrivePage({ driveUrl, chatDocs }: NewFromDrivePageProps) {
  if (driveUrl === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-xl font-semibold mb-4">Invalid Link</h1>
        <p className="text-muted-foreground">No Google Drive URL was provided.</p>
      </div>
    );
  }

  if (driveUrl === undefined) {
    return <Loading />;
  }

  if (!chatDocs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
        <h1 className="text-xl font-semibold">Downloading files from Google Drive...</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
      <h1 className="text-xl font-semibold">Files are now processing...</h1>
      <p className="text-muted-foreground">You will be redirected as soon as at least one file finished processing. <br /> This could take upto 5 minutes depending on the size of the file.</p>
      <div className="max-w-xl flex flex-col gap-2 w-full">
        {chatDocs.processing.map((doc) => (
          <div key={doc.name} className="flex items-center justify-between p-3 bg-background rounded-lg shadow-sm border opacity-70 w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-primary/10 rounded-md"><FileText size={16} className="text-primary" /></div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">Processing...</p>
              </div>
            </div>
            <Loader className="w-4 h-4 animate-spin text-primary" />
          </div>
        ))}
      </div>
    </div>
  );
}

