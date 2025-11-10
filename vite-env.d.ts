// The reference to "vite/client" was removed as it was causing a type definition error.

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  // you can add more env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add declaration for process.env.API_KEY to align with @google/genai guidelines
declare var process: {
  env: {
    API_KEY: string;
  }
};
