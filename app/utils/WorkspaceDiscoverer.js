const fs = require("fs");
const { join } = require("path");
const { BrowserWindow, app } = require("electron");
const Config = require("./Config");
const Logger = require("./Logger");

const path = join(app.getPath("documents"), "PowerBI SE/discoveries.json");

/**
 * @class
 * @public
 */
class WorkspaceDiscoverer {
    /**
     * BrowserWindow for the process
     * @type {BrowserWindow}
     * @public
     */
    window = null;

    /**
     * Discover all available workspaces
     * @param {import('puppeteer-in-electron')} pie Puppeteer in Electron
     * @param {import('puppeteer-core').Browser} browser Puppeteer browser
     * @returns {Promise<Array<WorkspaceDsc>>}
     * @public
     * @static
     * @async
     */
    static async discover(pie, browser) {
        // Window setup
        this.window = new BrowserWindow({
            height: 810,
            width: 1440,
            icon: "assets/icon.ico",
            show: Config.getAppOptions().showDiscovery,
            webPreferences: {
                nodeIntegration: false,
                enableRemoteModule: false,
                zoomFactor: 0.5,
                offscreen: !Config.getAppOptions().showDiscovery,
            },
        });
        this.window.setMenu(null);

        let isClosed = false;

        this.window.on("close", () => {
            this.window.destroy();
            isClosed = true;
        });

        // Puppeteer setup
        const page = await pie.getPage(browser, this.window, true);

        // LOAD POWER BI
        let hasLoaded = false;
        while (!hasLoaded) {
            try {
                await page.goto("https://app.powerbi.com/home");
                hasLoaded = true;
            } catch (e) {
                if (isClosed) return [];
            }
        }

        // hasLoaded = false;
        // while (!hasLoaded) {
        //     try {
        //         await page.waitForSelector("span.pbi-fcl-np.ng-star-inserted", { timeout: 10000 });
        //         hasLoaded = true;
        //     } catch (e) {
        //         if (isClosed) return [];
        //     }
        // }

        try {
            //
            // List all workspaces
            //

            let wbtn = await page.$("button.workspacesPaneExpander.switcher");
            while (!isClosed && !wbtn) {
                wbtn = await page.$("button.workspacesPaneExpander.switcher");
            }
            wbtn.click();
            const scrollSelector =
                "cdk-virtual-scroll-viewport.cdk-virtual-scroll-viewport.cdk-virtual-scrollable";
            await page.waitForSelector(scrollSelector);
            const scroll = await page.$(scrollSelector);
            const scrollHeight = await (await scroll.getProperty("scrollHeight")).jsonValue();

            const out = [];

            for (let i = 0; i <= scrollHeight; i += 200) {
                // Scroll
                await page.evaluate(
                    (scroll, i) => {
                        scroll.scroll(0, i);
                    },
                    scroll,
                    i
                );

                // List rows
                const rowsSelector = "tri-workspace-button.workspace-list-item";
                await page.waitForSelector(rowsSelector);
                for (const row of await page.$$(rowsSelector)) {
                    let name = await (
                        await (await row.$("button span.workspace-name")).getProperty("textContent")
                    ).jsonValue();
                    name = name.slice(1).slice(0, name.length - 2);

                    const icon = await row.$("button tri-workspace-icon.workspace-icon img");
                    const iconSrc = [undefined, null].includes(icon)
                        ? null
                        : await (await icon.getProperty("src")).jsonValue();

                    if (!out.find(w => w.name === name))
                        out.push({
                            name: name,
                            icon: iconSrc,
                            contents: [],
                            paths: { exports: [], anomalies: [] },
                        });
                }
            }

            out.sort((w1, w2) => {
                return w1.name > w2.name ? 1 : -1;
            });

            //
            // Get all workspaces IDs
            //

            for (const w of out) {
                wbtn = await page.$("button.workspacesPaneExpander.switcher");
                while (!isClosed && !wbtn) {
                    wbtn = await page.$("button.workspacesPaneExpander.switcher");
                }
                wbtn.click();

                const inputSelector = "tri-search-box.workspace-search input";
                await page.waitForSelector(inputSelector);
                let input = await page.$(inputSelector);
                while (!isClosed && !input) {
                    input = await page.$(inputSelector);
                }
                await input.type(w.name);

                wbtn = await page.$("tri-workspace-button.workspace-list-item");
                wbtn.click();

                try {
                    await page.waitForNavigation({ timeout: 2000 });
                } catch (error) {
                    /* empty */
                }

                w["id"] = page.url().split("/")[4];
            }

            this.write(out);

            this.window.close();
            return out;
        } catch ({ name, message }) {
            Logger.error(`${name} : ${message}`);
            this.window.close();
            return [];
        }
    }

    /**
     * Stop workspace discovery
     * @public
     * @static
     */
    static stop() {
        try {
            this.window.close();
        } catch (error) {
            /* empty */
        }
    }

    /**
     * Get discovered workspace from disk
     * @returns {Array<WorkspaceDsc>}
     * @public
     * @static
     */
    static read() {
        if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));
        return JSON.parse(fs.readFileSync(path));
    }

    /**
     * Save workspaces to disk
     * @param {Array<Workspace>} workspaces
     * @public
     * @static
     */
    static write(workspaces) {
        const out = workspaces.map(w => {
            return {
                id: w.id,
                name: w.name,
                icon: w.icon,
                contents: w.contents.map(c => {
                    return {
                        url: c.url,
                        name: c.name,
                        type: c.type,
                    };
                }),
                paths: w.paths,
            };
        });
        fs.writeFileSync(path, JSON.stringify(out, null, 4));
    }
}

module.exports = WorkspaceDiscoverer;
