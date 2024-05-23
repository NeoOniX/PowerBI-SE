const { BrowserWindow } = require("electron");
const Config = require("./Config");
const Logger = require("./Logger");

/**
 * @class
 * @public
 */
class Crawler {
    /**
     * Start crawling on `workspace` using `page`
     * @param {import('puppeteer').Page} page
     * @param {Workspace} workspace
     * @public
     * @static
     */
    static async crawl(page, workspace) {
        // Set empty contents
        workspace.contents = [];

        // Go to list
        await page.goto(`https://app.powerbi.com/groups/${workspace.id}/list`);

        // Get workspace info
        try {
            const nameElem = await page.waitForSelector("h1.title");
            workspace.name = await (await nameElem.getProperty("textContent")).jsonValue();

            const iconElem = await page.waitForSelector(
                "img.tri-h-full.tri-w-full.ng-star-inserted",
                {
                    timeout: 500,
                }
            );
            workspace.icon = await (await iconElem.getProperty("src")).jsonValue();
        } catch (error) {
            workspace.icon = null;
        }

        // List content
        try {
            const scroll = await page.$(
                "cdk-virtual-scroll-viewport.cdk-virtual-scroll-viewport.cdk-virtual-scroll-orientation-vertical.ng-star-inserted"
            );

            const listRows = async () => {
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    try {
                        // Select first row
                        const row = await page.$("div.row");

                        // Collect infos
                        const cont = {};

                        // Check if type is correct
                        const typeCellElem = await row.$("span.col-type");
                        cont["type"] = await (
                            await typeCellElem.getProperty("textContent")
                        ).jsonValue();
                        if (["Rapport", "Tableau de bord"].includes(cont["type"])) {
                            const nameCellElem = await row.$("span.col-name a.name");
                            cont["name"] = await (
                                await nameCellElem.getProperty("textContent")
                            ).jsonValue();
                            cont["name"] = cont["name"].slice(1).slice(0, cont["name"].length - 2);
                            cont["url"] = await (
                                await nameCellElem.getProperty("href")
                            ).jsonValue();
                            cont["url"] = cont["url"].split("?")[0];
                            cont["id"] = cont["url"].split("/");
                            cont["id"] = cont["id"][cont["id"].length - 1];
                            cont["pages"] = [];
                            cont["isError"] = false;

                            // Push infos in workspace contents
                            workspace.contents.push(cont);
                        }

                        // Remove row
                        await page.evaluate(row => {
                            row.parentNode.removeChild(row);
                        }, row);
                    } catch (error) {
                        break;
                    }
                }
            };

            if (scroll) {
                const sHeight = await (await scroll.getProperty("scrollHeight")).jsonValue();
                for (let i = 0; i <= sHeight; i += 100) {
                    await page.evaluate(
                        (scroll, i) => {
                            scroll.scroll(0, i);
                        },
                        scroll,
                        i
                    );
                    await listRows();
                }
            } else {
                await listRows();
            }
        } catch ({ name, message }) {
            Logger.error(`${name} : ${message}`);
        }
    }

    /**
     * Crawl a single workspace
     * @param {import('puppeteer-in-electron')} pie Puppeteer in Electron
     * @param {import('puppeteer-core').Browser} browser Puppeteer browser
     * @param {Workspace} workspace
     * @public
     * @static
     */
    static async single(pie, browser, workspace) {
        // Window setup
        const win = new BrowserWindow({
            height: 810,
            width: 1440,
            show: Config.getAppOptions().showWindows,
            webPreferences: {
                nodeIntegration: false,
                enableRemoteModule: false,
                zoomFactor: 0.5,
                offscreen: !Config.getAppOptions().showWindows,
            },
        });
        win.setMenu(null);

        let isClosed = false;

        win.on("close", () => {
            win.destroy();
            isClosed = true;
        });

        // Puppeteer setup
        const page = await pie.getPage(browser, win, true);

        // LOAD POWER BI
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

        // Start crawl
        await this.crawl(page, workspace);

        win.close();
    }
}

module.exports = Crawler;
