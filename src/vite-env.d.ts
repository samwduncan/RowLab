/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_OLLAMA_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
