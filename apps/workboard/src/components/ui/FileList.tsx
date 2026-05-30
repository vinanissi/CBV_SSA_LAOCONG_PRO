import type { FileItem } from '@/api/contracts';
import { FEEDBACK_COPY } from '@/shared/utils/operatorFeedbackCopy';

interface FileListProps {
  files: FileItem[];
  compact?: boolean;
}

function openFileUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function FileEntry({ file, compact }: { file: FileItem; compact?: boolean }) {
  const canOpen = Boolean(file.fileUrl?.trim());
  const disabledTitle = FEEDBACK_COPY.disabled.fileUnlinked;

  if (compact) {
    if (!canOpen) {
      return (
        <span
          className="inline-flex max-w-[10rem] cursor-not-allowed items-center gap-1 truncate rounded border border-border/40 bg-surface-overlay/50 px-2 py-0.5 text-[10px] text-slate-500"
          title={disabledTitle}
          aria-disabled="true"
        >
          <span aria-hidden>📄</span>
          <span className="truncate">{file.fileName}</span>
        </span>
      );
    }
    return (
      <button
        type="button"
        title={file.fileName}
        aria-label={`Mở tệp ${file.fileName}`}
        className="inline-flex max-w-[10rem] items-center gap-1 truncate rounded border border-border/60 bg-surface-raised px-2 py-0.5 text-[10px] text-slate-300 hover:border-border-soft hover:bg-surface-overlay"
        onClick={() => openFileUrl(file.fileUrl!)}
      >
        <span aria-hidden>📄</span>
        <span className="truncate">{file.fileName}</span>
      </button>
    );
  }

  if (!canOpen) {
    return (
      <div
        className="flex w-full cursor-not-allowed items-center gap-3 rounded-md border border-border/40 bg-surface-overlay/40 px-3 py-2.5 opacity-70"
        title={disabledTitle}
        aria-disabled="true"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-overlay text-sm">📄</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-500">{file.fileName}</span>
          <span className="text-xs text-slate-500">{disabledTitle}</span>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Mở tệp ${file.fileName}`}
      className="flex w-full items-center gap-3 rounded-md border border-border/60 bg-surface-raised px-3 py-2.5 text-left hover:border-border-soft hover:bg-surface-overlay"
      onClick={() => openFileUrl(file.fileUrl!)}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-overlay text-sm">📄</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-100">{file.fileName}</span>
        <span className="text-xs text-slate-500">{file.fileGroup}</span>
      </span>
    </button>
  );
}

export function FileList({ files, compact }: FileListProps) {
  if (files.length === 0) {
    return <p className="task-meta-passive text-xs">{FEEDBACK_COPY.disabled.noFile}</p>;
  }

  if (compact) {
    return (
      <ul className="flex flex-wrap gap-1">
        {files.map((file) => (
          <li key={file.fileId}>
            <FileEntry file={file} compact />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li key={file.fileId}>
          <FileEntry file={file} />
        </li>
      ))}
    </ul>
  );
}
