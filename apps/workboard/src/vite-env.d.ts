/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CBV_API_BASE_URL?: string;
  readonly VITE_CBV_ROLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
