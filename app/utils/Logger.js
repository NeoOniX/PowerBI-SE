const fs = require("fs");
const { join } = require("path");
const { app } = require("electron");

const path = join(app.getPath("documents"), "PowerBI SE");

/**
 * @class
 * @public
 */
class Logger {
    /**
     * @static
     * @private
     * @param {string} message Output message
     */
    static write(message) {
        const date = new Date();

        const fdate = `${("0000" + date.getFullYear()).slice(-4)}-${(
            "00" +
            date.getMonth() +
            1
        ).slice(-2)}-${("00" + date.getDate()).slice(-2)}`;

        const ftime = `${("00" + date.getHours()).slice(-2)}h-${("00" + date.getMinutes()).slice(
            -2
        )}m-${("00" + date.getSeconds()).slice(-2)}s-${("000" + date.getMilliseconds()).slice(
            -3
        )}ms`;

        console.log(`${fdate}_${ftime} - ${message}`);
        fs.appendFileSync(join(path, "logs.txt"), `${fdate}_${ftime} - ${message}\n`);
    }

    /**
     * @static
     * @public
     */
    static init() {
        fs.writeFileSync(join(path, "logs.txt"), "");
    }

    /**
     * @static
     * @public
     * @param {string} message Log message
     */
    static log(message) {
        this.write(`LOG - ${message}`);
    }

    /**
     * @static
     * @public
     * @param {string} message Warn message
     */
    static warn(message) {
        this.write(`WARN - ${message}`);
    }

    /**
     * @static
     * @public
     * @param {string} message Error message
     */
    static error(message) {
        this.write(`ERROR - ${message}`);
    }
}

module.exports = Logger;
