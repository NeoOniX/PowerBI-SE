const { contextBridge, ipcRenderer, webFrame } = require("electron");

webFrame.setZoomFactor(1);

contextBridge.exposeInMainWorld("electron", {
    // Process
    startProcess() {
        ipcRenderer.send("start-process");
    },
    stopProcess() {
        ipcRenderer.send("stop-process");
    },
    setProcessEndListener(listener) {
        ipcRenderer.removeAllListeners("res-process");
        ipcRenderer.on("res-process", () => {
            listener();
        });
    },
    // Login
    login() {
        ipcRenderer.send("start-pbi-login");
    },
    addLoginListener(listener) {
        ipcRenderer.on("res-pbi-login", (event, args) => {
            listener(args);
        });
    },
    // Config
    readConfig() {
        ipcRenderer.send("start-read-config");
    },
    writeConfig() {
        ipcRenderer.send("start-write-config");
    },
    updateConfig(config) {
        ipcRenderer.send("start-update-config", config);
    },
    setConfigReceivedListener(listener) {
        ipcRenderer.removeAllListeners("main-config-received");
        ipcRenderer.on("main-config-received", (event, args) => {
            listener(args);
        });
    },
    addWorkspaceExport(workspace) {
        ipcRenderer.send("start-add-workspace-export", workspace);
    },
    addWorkspaceAnomalie(workspace) {
        ipcRenderer.send("start-add-workspace-anomalie", workspace);
    },
    // App Options
    getAppOptions() {
        ipcRenderer.send("start-get-app-options");
    },
    setAppOptions(options) {
        ipcRenderer.send("start-set-app-options", options);
    },
    addGlobalExportPath() {
        ipcRenderer.send("start-add-global-export");
    },
    addGlobalAnomaliePath() {
        ipcRenderer.send("start-add-global-anomalie");
    },
    addOnAppOptionsReceivedListener(listener) {
        ipcRenderer.on("res-app-options", (event, args) => {
            listener(args);
        });
    },
    // Workspace Discovery
    getWorkspaces() {
        ipcRenderer.send("start-workspaces-get");
    },
    startWorkspacesDiscovery() {
        ipcRenderer.send("start-workspaces-discovery");
    },
    stopWorkspacesDiscovery() {
        ipcRenderer.send("stop-workspaces-discovery");
    },
    setWorkspacesDiscoveryListener(listener) {
        ipcRenderer.removeAllListeners("res-workspaces-discovery");
        ipcRenderer.on("res-workspaces-discovery", (event, args) => {
            listener(args);
        });
    },
    // Single Crawl
    crawl(workspaceID) {
        ipcRenderer.send("start-single-crawl", workspaceID);
    },
    // Data
    getData() {
        ipcRenderer.send("start-get-data");
    },
    setDataListener(listener) {
        ipcRenderer.removeAllListeners("res-data");
        ipcRenderer.on("res-data", (event, args) => {
            listener(args);
        });
    },
    // External open
    openInBrowser(url) {
        ipcRenderer.send("open-in-browser", url);
    },
});
