declare global {
    // Enums
    enum ContentType {
        Rapport = "Rapport",
        TDB = "Tableau de bord",
    }

    // Interfaces
    interface Content {
        id: string;
        name: string;
        type: ContentType;
        url: string;
    }
    interface Workspace {
        id: string;
        name: string;
        icon: string | null;
        contents: Array<Content>;
    }

    interface AppOptions {
        uploadPath: string;
        showWindows: boolean;
        showDiscovery: boolean;
    }

    interface ExportData {
        WorkspaceName: string;
        WorkspaceIcon: string;
        ContentName: string;
        ContentType: ContentType;
        PageName: string;
        URL: string;
        Tags: Array<string>;
    }

    interface AnomalyData {
        WorkspaceName: string;
        WorkspaceIcon: string;
        ContentName: string;
        ContentType: ContentType;
        URL: string;
        Reason: string;
    }

    interface Data {
        Exports: Array<ExportData>;
        Anomalies: Array<AnomalyData>;
    }

    // Expose to DOM
    interface Window {
        electron: {
            // Process
            startProcess(): void;
            stopProcess(): void;
            setProcessEndListener(listener: () => void): void;
            // Login
            login(): void;
            addLoginListener(listener: (name: string) => void): void;
            // Config
            readConfig(): void;
            writeConfig(): void;
            updateConfig(config: Array<Array<Workspace>>): void;
            setConfigReceivedListener(listener: (config: Array<Array<Workspace>>) => void): void;
            // App Options
            getAppOptions(): void;
            setAppOptions(options: AppOptions): void;
            setExportPath(): void;
            addOnAppOptionsReceivedListener(listener: (config: AppOptions) => void): void;
            // Workspace Discovery
            startWorkspacesDiscovery(): void;
            stopWorkspacesDiscovery(): void;
            setWorkspacesDiscoveryListener(listener: (workspaces: Array<Workspace>) => void): void;
            // Single crawl
            crawl(workspaceID: string): void;
            // Data
            getData(): void;
            setDataListener(listener: (data: Data) => void): void;
            // External open
            openInBrowser(url: string): void;
        };
    }
}

export {};
