import type { ReactNode } from 'react';

interface WorkInboxV3ImageBLayoutProps {
  children: ReactNode;
}

/** Canonical 3-region shell for cbv-work-inbox-v3-B.png */
export function WorkInboxV3ImageBLayout({ children }: WorkInboxV3ImageBLayoutProps) {
  return (
    <div
      className="work-inbox-v3-image-b"
      data-cbv-layout="work-inbox-v3-image-b"
      aria-label="Work Inbox V3 Image B"
    >
      {children}
    </div>
  );
}
