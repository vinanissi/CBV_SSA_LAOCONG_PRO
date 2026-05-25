import type { FileItem } from '@/api/contracts';

export function FileList({ files }: { files: FileItem[] }) {
  if (files.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có tệp đính kèm.</p>;
  }

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li key={file.fileId}>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-md border border-border/60 bg-surface-raised px-3 py-2.5 text-left hover:border-border-soft hover:bg-surface-overlay"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-overlay text-sm">
              📄
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-100">{file.fileName}</span>
              <span className="text-xs text-slate-500">{file.fileGroup}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
