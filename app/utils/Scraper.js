/* eslint-disable indent */
const Logger = require("./Logger");

const re = /[^a-zA-Z0-9À-ÿ]/gi;

const lookFor = [
    ".textbox p span.textRun",
    ".slicer-header-text",
    ".preTextWithEllipsis",
    ".columnHeaders div div .pivotTableCellWrap.cell-interactive.tablixAlignCenter",
    "[role=columnheader].pivotTableCellWrap",
    ".xAxisLabel",
    ".yAxisLabel",
    ".headerText .headerTitleWrapper .displayText",
];

/**
 * Convert an array of complete string to an array of keywords
 * @param {Array<string>} scraped
 * @returns {Array<string>}
 * @public
 * @static
 */
const keywords = scraped => {
    const out = [];

    for (let tag of scraped) {
        tag = tag.replace(re, " ");

        for (const w of tag.split(" ")) {
            if ((w.length >= 3 || w !== w.toLowerCase()) && !out.includes(w.toLowerCase()))
                out.push(w.toLowerCase());
        }
    }

    return out;
};

/**
 * Read page from content
 * @param {import('puppeteer').Page} page
 * @param {Content} content
 * @public
 * @static
 * @async
 */
const readPage = async (page, content) => {
    // Read page id
    const pId = page.url().split("/").slice(-1)[0].split("?")[0];
    // Read tags
    let tags = [content.name];
    //   Read page name
    let pName = content.name;
    const pBtnElem = await page.$("button.mat-list-item.item.selected");
    if (pBtnElem) {
        const pBtnText = await (await pBtnElem.getProperty("textContent")).jsonValue();
        pName = pBtnText;
        tags = tags.concat([pBtnText]);
    }
    //   Read page content
    for (const lf of lookFor) {
        try {
            await page.waitForSelector(lf, { timeout: 2500 });
        } catch (error) {
            /* empty */
        } finally {
            const elems = await page.$$(lf);
            for (const elem of elems) {
                const tc = await (await elem.getProperty("textContent")).jsonValue();
                tags = tags.concat([tc]);
            }
        }
    }

    // Screenshot
    let s = "";
    try {
        const sElem = await page.$("#content[role=main]");
        s = await sElem.screenshot({
            type: "jpeg",
            encoding: "base64",
            quality: 10,
            clip: { x: 30, y: 25, height: 747, width: 1390 },
        });
    } catch (error) {
        /* empty */
    }

    content.pages.push({
        id: pId,
        name: pName,
        tags: keywords(tags),
        url: page.url(),
        screenshot: s,
    });
};

/**
 * @class
 * @public
 */
class Scraper {
    /**
     * Start scraping on `workspace` using `page`
     * @param {import('puppeteer').Page} page
     * @param {Workspace} workspace
     * @public
     * @static
     * @async
     */
    static async scrap(page, workspace) {
        for (const c of workspace.contents) {
            try {
                // Go to content page
                await page.goto(c.url);

                // Set empty pages if undefined
                if (!c.pages) c.pages = [];

                // Check if error
                try {
                    await page.waitForSelector("div.appBarContent div button.mat-menu-trigger", {
                        timeout: 60000,
                    });

                    // Remove precedent content from history
                    const history = await page.$$(".top-right-icon.close-button.ng-star-inserted");

                    if (history.length >= 2) {
                        for (let i = 1; i < history.length; i++) {
                            await history[i].evaluate(b => b.click());
                        }
                    }

                    // Read each page
                    const ps = await page.$$(".mat-list-item-content .itemName");

                    if (ps.length === 0) {
                        await readPage(page, c);
                    } else {
                        for (const p of ps) {
                            await p.click();
                            await readPage(page, c);
                        }
                    }
                } catch ({ name, message }) {
                    c.isError = true;
                    // Get error message
                    const errorReasonElem = await page.$("h4.mat-dialog-title");
                    c.errorReason = errorReasonElem
                        ? await (await errorReasonElem.getProperty("textContent")).jsonValue()
                        : name === "TimeoutError"
                        ? "Timed out"
                        : `Other - ${name}`;

                    Logger.warn(`${c.name} > ${c.errorReason} : ${message}`);
                    continue;
                }

                Logger.log(`SCRAP - ${c.name}`);
            } catch ({ name, message }) {
                Logger.error(`${c.name} > ${name} : ${message}`);
            }
        }
    }
}

module.exports = Scraper;
