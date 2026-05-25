/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CBV_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
