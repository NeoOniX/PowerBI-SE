const { app, BrowserWindow, ipcMain, shell } = require("electron");
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
const { join } = require("path");
const isDev = require("electron-is-dev");
const { WorkspaceDiscoverer, Crawler, Config, Process, DataReader } = require("./utils");
const { createURLRoute, createFileRoute } = require("electron-router-dom");

// Remove security warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

// Disable Hardware Acceleration for Offscreen rendering
app.disableHardwareAcceleration();

// Router setup
const mainDevServerURL = createURLRoute("http://localhost:3000", "main");
const mainFileRoute = createFileRoute(join(__dirname, "../build/index.html"), "main");

let workspaces = [];
let config = [];
const processes = [];

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
    const mainWindow = new BrowserWindow({
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
    isDev ? mainWindow.loadURL(mainDevServerURL) : mainWindow.loadFile(...mainFileRoute);

    // IPC Setup
    ipcMain.on("start-pbi-login", () => login(mainWindow, browser));
    ipcMain.on("start-single-crawl", (event, arg) => singleCrawl(browser, arg));
    ipcMain.on("start-get-data", () => mainWindow.webContents.send("res-data", DataReader.read()));
    ipcMain.on("open-in-browser", (event, arg) => shell.openExternal(arg));

    // IPC Setup - Workspaces
    ipcMain.on("start-workspaces-get", () =>
        mainWindow.webContents.send("res-workspaces-discovery", workspaces)
    );
    ipcMain.on("start-workspaces-discovery", () => startWorkspacesDiscovery(mainWindow, browser));
    ipcMain.on("stop-workspaces-discovery", () => stopWorkspacesDiscovery(mainWindow));

    // IPC Setup - Process
    ipcMain.on("start-process", () => startProcess(mainWindow, browser));
    ipcMain.on("stop-process", stopProcess);

    // IPC Setup - AppOptions
    ipcMain.on("start-get-app-options", () => {
        mainWindow.webContents.send("res-app-options", Config.getAppOptions());
    });
    ipcMain.on("start-set-app-options", (event, arg) => {
        Config.setAppOptions(arg);
        mainWindow.webContents.send("res-app-options", Config.getAppOptions());
    });
    ipcMain.on("start-set-export-path", async () => {
        mainWindow.webContents.send("res-app-options", await Config.setExportPath());
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
};

/**
 * Start configured processes
 * @param {BrowserWindow} mainWindow
 * @param {puppeteer.Browser} browser
 */
const startProcess = (mainWindow, browser) => {
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
 * @param {BrowserWindow} mainWindow
 * @param {puppeteer.Browser} browser
 */
const login = async (mainWindow, browser) => {
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
        mainWindow.focus();
        isClosed = true;
    });

    const page = await pie.getPage(browser, loginWindow, true);

    // Load Power BI
    let hasLoaded = false;
    while (!hasLoaded) {
        try {
            await page.goto("https://app.powerbi.com/home");
            hasLoaded = true;
        } catch (e) {
            if (isClosed) return;
        }
    }

    hasLoaded = false;
    while (!hasLoaded) {
        try {
            await page.waitForSelector("span.pbi-fcl-np.ng-star-inserted", { timeout: 10000 });
            hasLoaded = true;
        } catch (e) {
            if (isClosed) return;
        }
    }

    // Get profile name
    let profileButton = null;
    while (!profileButton) {
        profileButton = await page.$(
            "button.menuButton.userInfoButton.pbi-bgc-tp.pbi-fcl-np.pbi-bcl-tp.pbi-bgc-ts-h.pbi-bgc-ts-f"
        );
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
 * @param {BrowserWindow} mainWindow
 * @param {puppeteer.Browser} browser
 */
const startWorkspacesDiscovery = async (mainWindow, browser) => {
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
 * @param {BrowserWindow} mainWindow
 */
const stopWorkspacesDiscovery = mainWindow => {
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

app.once("ready", main);

init();
