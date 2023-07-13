const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
const { join } = require("path");
const isDev = require("electron-is-dev");
const { WorkspaceDiscoverer, Crawler, Config, Process, DataReader } = require("./utils");

// Remove security warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

// Disable Hardware Acceleration for Offscreen rendering
app.disableHardwareAcceleration();

// Single instance lock
const instanceLock = app.requestSingleInstanceLock();

// AutoUpdater Setup

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on("update-available", () => {
    if (mainWindow && mainWindow instanceof BrowserWindow) {
        mainWindow.webContents.send("update-available");
    }
});

autoUpdater.on("update-downloaded", () => {
    if (mainWindow && mainWindow instanceof BrowserWindow) {
        mainWindow.webContents.send("update-downloaded");
    }
});

// Variables Setup

let workspaces = [];
let config = [];
const processes = [];

let mainWindow = null;

const init = async () => {
    // PIE Setup
    await pie.initialize(app);
};

const main = async () => {
    Config.checkFolders();
    workspaces = WorkspaceDiscoverer.read();

    // Connect Puppeteer
    const browser = await pie.connect(app, puppeteer);

    // Main page
    mainWindow = new BrowserWindow({
        height: 810,
        width: 1440,
        backgroundColor: "#000000",
        icon: "assets/icon.ico",
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false,
            preload: __dirname + "/preloads/preload.js",
        },
    });

    mainWindow.setMenu(null);

    // Open DevTools
    // mainWindow.webContents.openDevTools();

    // Load main page
    mainWindow.loadURL(
        isDev ? "http://localhost:3000" : `file://${join(__dirname, "../build/index.html")}`
    );

    // IPC Setup
    ipcMain.on("start-pbi-login", () => login(browser));
    ipcMain.on("start-single-crawl", (event, arg) => singleCrawl(browser, arg));
    ipcMain.on("start-get-data", () => mainWindow.webContents.send("res-data", DataReader.read()));
    ipcMain.on("open-in-browser", (event, arg) => shell.openExternal(arg));

    // IPC Setup - Workspaces
    ipcMain.on("start-workspaces-get", () =>
        mainWindow.webContents.send("res-workspaces-discovery", workspaces)
    );
    ipcMain.on("start-workspaces-discovery", () => startWorkspacesDiscovery(browser));
    ipcMain.on("stop-workspaces-discovery", () => stopWorkspacesDiscovery());

    // IPC Setup - Process
    ipcMain.on("start-process", () => startProcess(browser));
    ipcMain.on("stop-process", stopProcess);

    // IPC Setup - AppOptions
    ipcMain.on("start-get-app-options", () => {
        mainWindow.webContents.send("res-app-options", Config.getAppOptions());
    });
    ipcMain.on("start-set-app-options", (event, arg) => {
        Config.setAppOptions(arg);
        mainWindow.webContents.send("res-app-options", Config.getAppOptions());
    });
    ipcMain.on("start-add-global-export", async () => {
        mainWindow.webContents.send("res-app-options", await Config.addExportPath());
    });
    ipcMain.on("start-add-global-anomalie", async () => {
        mainWindow.webContents.send("res-app-options", await Config.addAnomaliePath());
    });

    // IPC Setup - Config
    ipcMain.on("start-read-config", async () => {
        config = await Config.read();
        mainWindow.webContents.send("main-config-received", config);
    });
    ipcMain.on("start-write-config", async () => {
        await Config.write(config);
    });
    ipcMain.on("start-update-config", (event, arg) => {
        config = arg;
        mainWindow.webContents.send("main-config-received", config);
    });
    ipcMain.on("start-add-workspace-export", async (event, arg) => {
        const p = await Config.addWorkspacePath();
        if (p === null) return;
        config.forEach(proc => {
            proc.forEach(w => {
                if (w.name === arg.name) {
                    w.paths.exports.push({
                        path: p,
                        format: "pbse_exports_{date}_{time}_{workspaceId}.json",
                    });
                }
            });
        });
        mainWindow.webContents.send("main-config-received", config);
    });
    ipcMain.on("start-add-workspace-anomalie", async (event, arg) => {
        const p = await Config.addWorkspacePath();
        if (p === null) return;
        config.forEach(proc => {
            proc.forEach(w => {
                if (w.name === arg.name) {
                    w.paths.anomalies.push({
                        path: p,
                        format: "pbse_anomalies_{date}_{time}_{workspaceId}.json",
                    });
                }
            });
        });
        mainWindow.webContents.send("main-config-received", config);
    });

    // IPC Setup - Update
    ipcMain.on("start-update-download", () => {
        autoUpdater.downloadUpdate();
    });
    ipcMain.on("start-update-restart", () => {
        autoUpdater.quitAndInstall(true, true);
    });

    // Check Update
    autoUpdater.checkForUpdatesAndNotify();
};

/**
 * Start configured processes
 * @param {puppeteer.Browser} browser
 */
const startProcess = browser => {
    for (const p of config) {
        if (p.length === 0) continue;
        const proc = new Process(p);
        processes.push(proc);
        proc.setup(pie, browser).then(proc => {
            proc.destroy();
            processes.filter((pr, i, arr) => {
                if (pr === proc) {
                    arr.splice(i, 1);
                    return true;
                }
                return false;
            });
            if (processes.length === 0) {
                mainWindow.webContents.send("res-process");
            }
        });
    }
    if (processes.length === 0) {
        mainWindow.webContents.send("res-process");
    }
};

/**
 * Stop ongoing processes
 */
const stopProcess = () => {
    for (const p of processes) {
        p.destroy();
    }
    mainWindow.webContents.send("res-process");
};

/**
 * Open the login window
 * @param {puppeteer.Browser} browser
 */
const login = async browser => {
    // Login window
    const loginWindow = new BrowserWindow({
        height: 650,
        width: 450,
        icon: "assets/icon.ico",
        webPreferences: {
            preload: __dirname + "/preloads/preload-zr.js",
        },
    });

    loginWindow.setMenu(null);

    let isClosed = false;

    loginWindow.on("close", () => {
        loginWindow.destroy();
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        isClosed = true;
    });

    const page = await pie.getPage(browser, loginWindow, true);

    // Load Power BI
    let hasLoaded = false;
    while (!hasLoaded) {
        try {
            await page.goto("https://app.powerbi.com/home", { waitUntil: "networkidle2" });
            hasLoaded = true;
        } catch (e) {
            if (isClosed) return;
        }
    }

    hasLoaded = false;
    while (!hasLoaded) {
        try {
            await page.waitForSelector("span.pbi-fcl-np.ng-star-inserted", { timeout: 0 });
            hasLoaded = true;
        } catch (e) {
            if (isClosed) return;
        }
    }

    // Get profile name
    let profileButton = null;
    while (!profileButton) {
        profileButton = await page.$("button.userInfoButton");
        if (isClosed) return;
    }

    await profileButton.click();

    let profileName = null;
    while (!profileName) {
        profileName = await page.$("div.user-name.ng-star-inserted");
        if (isClosed) return;
    }
    profileName = await (await profileName.getProperty("textContent")).jsonValue();

    // Send data to main window
    mainWindow.webContents.send("res-app-options", Config.getAppOptions());
    mainWindow.webContents.send("res-pbi-login", profileName);

    loginWindow.close();
};

/**
 * Start the workspaces discovery process
 * @param {puppeteer.Browser} browser
 */
const startWorkspacesDiscovery = async browser => {
    try {
        const tmp = await WorkspaceDiscoverer.discover(pie, browser);
        if (tmp && tmp.length !== 0) {
            workspaces = tmp;
        }
        mainWindow.webContents.send("res-workspaces-discovery", workspaces);
    } catch (error) {
        /* empty */
    }
};

/**
 * Start the workspaces discovery process
 */
const stopWorkspacesDiscovery = () => {
    WorkspaceDiscoverer.stop();
    mainWindow.webContents.send("res-workspaces-discovery", workspaces);
};

/**
 * Crawl single workspace
 * @param {puppeteer.Browser} browser
 * @param {string} workspaceID
 */
const singleCrawl = async (browser, workspaceID) => {
    await Crawler.single(
        pie,
        browser,
        workspaces.find(w => w.id === workspaceID)
    );

    WorkspaceDiscoverer.write(workspaces);
};

if (!instanceLock) {
    app.quit();
} else {
    app.on("second-instance", _ => {
        if (mainWindow && mainWindow instanceof BrowserWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.once("ready", main);

    init();
}
