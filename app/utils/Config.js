const fs = require("fs");
const { join } = require("path");
const { app, dialog } = require("electron");

const path = join(app.getPath("documents"), "PowerBI SE");

const defaultAppOptions = {
    showWindows: false,
    showDiscovery: false,
    uploadPath: join(path, "/data/"),
};

/**
 * @typedef {Object} SaveResponse
 * @property {boolean} canceled Has the dialog been canceled
 * @property {boolean} error Has an error occured
 * @property {String} message Status message
 *
 * @typedef {Object} AppOptions
 * @property {boolean} showWindows Are the windows shown
 * @property {boolean} showDiscovery Is the discovery window shown
 * @property {String} uploadPath Path to upload the files
 */

/**
 * @class
 * @public
 */
class Config {
    /**
     * Application options
     * @type {AppOptions}
     * @private
     */
    static appOptions = {};

    /**
     * Get the application options
     * @returns {AppOptions}
     * @public
     * @static
     */
    static getAppOptions() {
        if (Object.keys(this.appOptions).length === 0) {
            if (!fs.existsSync(join(path, "app_cfg.json"))) {
                fs.writeFileSync(
                    join(path, "app_cfg.json"),
                    JSON.stringify(defaultAppOptions, null, 4)
                );
            }
            this.appOptions = JSON.parse(fs.readFileSync(join(path, "app_cfg.json")));
        }

        return this.appOptions;
    }

    /**
     * Set the application options
     * @param {AppOptions} options Application options
     * @public
     * @static
     */
    static setAppOptions(options) {
        fs.writeFileSync(join(path, "app_cfg.json"), JSON.stringify(options, null, 4));
        this.appOptions = options;
    }

    /**
     * Open a file dialog to select the export path
     * @returns {Promise<AppOptions>}
     * @public
     * @static
     * @async
     */
    static async setExportPath() {
        try {
            const ret = await dialog.showOpenDialog({
                defaultPath: this.appOptions.uploadPath,
                properties: ["openDirectory", "dontAddToRecent", "createDirectory"],
            });
            if (!ret.canceled) {
                const options = this.getAppOptions();
                options.uploadPath = ret.filePaths[0];
                this.setAppOptions(options);
            }
        } catch (error) {
            /* empty */
        } finally {
            this.checkFolders();
            return this.getAppOptions();
        }
    }

    /**
     * Check if the folders exists, if not create them
     * @public
     * @static
     */
    static checkFolders() {
        // Default folders
        const folders = ["/configs/", "/data/"];
        for (const folder of folders) {
            if (!fs.existsSync(join(path, folder))) {
                fs.mkdirSync(join(path, folder), { recursive: true });
            }
        }

        // Export folder
        const subfolders = ["/Anomalies/", "/Exports/"];
        for (const folder of subfolders) {
            if (!fs.existsSync(join(this.getAppOptions().uploadPath, folder))) {
                fs.mkdirSync(join(this.getAppOptions().uploadPath, folder), { recursive: true });
            }
        }
    }

    /**
     * Open a file dialog to read a file containing a run options
     * @returns {Promise<RunOptions>}
     * @public
     * @static
     * @async
     */
    static async read() {
        try {
            const ret = await dialog.showOpenDialog({
                defaultPath: join(path, "/configs/"),
                filters: [
                    { name: "Run Config", extensions: ["json"] },
                    { name: "All files", extensions: ["*"] },
                ],
                properties: ["openFile", "dontAddToRecent"],
            });

            if (ret.canceled) {
                return [];
            } else {
                return JSON.parse(fs.readFileSync(ret.filePaths[0]));
            }
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    /**
     * Open a file dialog to save a file containing a run options
     * @param {RunOptions} options Run options to save
     * @returns {Promise<SaveResponse>}
     * @public
     * @static
     * @async
     */
    static async write(options) {
        try {
            const ret = await dialog.showSaveDialog({
                defaultPath: join(path, "/configs/"),
                filters: [
                    { name: "Config", extensions: ["json"] },
                    { name: "All files", extensions: ["*"] },
                ],
            });
            if (ret.canceled) {
                return {
                    canceled: true,
                    error: false,
                    message: "Canceled",
                };
            } else {
                fs.writeFileSync(ret.filePath, JSON.stringify(options, null, 4));
                return {
                    canceled: false,
                    error: false,
                    message: "OK",
                };
            }
        } catch (error) {
            return {
                canceled: false,
                error: true,
                message: error,
            };
        }
    }
}

module.exports = Config;
