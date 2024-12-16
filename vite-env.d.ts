interface ImportMetaEnv {
    readonly VITE_APPWRITE_PROJECT_ID: string;
    readonly VITE_APPWRITE_URL: string;
    readonly VITE_APPWRITE_STORAGE_ID: string;
    readonly VITE_APPWRITE_DATABASE_ID: string;

}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}