const { BrowserWindow } = require("electron");
const Crawler = require("./Crawler");
const Scraper = require("./Scraper");
const Uploader = require("./Uploader");
const Config = require("./Config");
const Logger = require("./Logger");

/**
 * @class
 * @public
 */
class Process {
    /**
     * List of workspaces for the process
     * @type {Array<Workspace>}
     * @public
     */
    workspaces = [];

    /**
     * BrowserWindow for the process
     * @type {BrowserWindow}
     * @public
     */
    window = null;

    /**
     * Puppeteer page
     * @type {import('puppeteer-core').Page}
     * @public
     */
    page = null;

    /**
     * Create a new process
     * @param {Array<Workspace>} workspaces List of workspaces
     * @public
     */
    constructor(workspaces) {
        this.workspaces = workspaces;
        this.window = new BrowserWindow({
            height: 810,
            width: 1440,
            icon: "assets/icon.ico",
            show: Config.getAppOptions().showWindows,
            webPreferences: {
                nodeIntegration: false,
                enableRemoteModule: false,
                zoomFactor: 0.5,
                offscreen: !Config.getAppOptions().showWindows,
            },
        });
        this.window.setMenu(null);
    }

    /**
     * Setup a Process and automatically starts it
     * @param {import('puppeteer-in-electron')} pie Puppeteer in Electron
     * @param {import('puppeteer-core').Browser} browser Puppeteer browser
     * @returns {Promise<Process>}
     * @public
     * @async
     */
    async setup(pie, browser) {
        try {
            // Puppeteer setup
            this.page = await pie.getPage(browser, this.window, true);

            for (const workspace of this.workspaces) {
                await Crawler.crawl(this.page, workspace);
                await Scraper.scrap(this.page, workspace);
                Uploader.upload(workspace);
            }

            return this;
        } catch ({ name, message }) {
            Logger.error(`${name} : ${message}`);
            return this;
        }
    }

    /**
     * Stop and destroy the process
     * @public
     */
    destroy() {
        if (this.window instanceof BrowserWindow && this.window.closable) {
            this.window.close();
            this.window = null;
        }
    }
}

module.exports = Process;
