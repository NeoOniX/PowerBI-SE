const { join } = require("path");
const fs = require("fs");
const Config = require("./Config");

/**
 * @typedef {Object} ExportData
 * @property {string} WorkspaceName
 * @property {string} WorkspaceIcon
 * @property {string} ContentName
 * @property {string} ContentType
 * @property {string} PageName
 * @property {string} URL
 * @property {Array<string>} Tags
 *
 * @typedef {Object} AnomalyData
 * @property {string} WorkspaceName
 * @property {string} WorkspaceIcon
 * @property {string} ContentName
 * @property {string} ContentType
 * @property {string} URL
 * @property {string} Reason
 *
 * @typedef {Object} Data
 * @property {Array<ExportData>} Exports
 * @property {Array<AnomalyData>} Anomalies
 */

/**
 * @class
 * @public
 */
class DataReader {
    /**
     * Read data from the export path
     * @returns {Data}
     * @public
     * @static
     */
    static read() {
        // Exports
        const exportsDataDict = {};
        const e = fs.readdirSync(join(Config.getAppOptions().uploadPath, "/Exports/"));
        e.map(name => ({
            name,
            time: fs
                .statSync(join(Config.getAppOptions().uploadPath, "/Exports/", name))
                .mtime.getTime(),
        }))
            .sort((a, b) => a.time - b.time)
            .forEach(file => {
                JSON.parse(
                    fs.readFileSync(join(Config.getAppOptions().uploadPath, "/Exports/", file.name))
                ).forEach(exportData => {
                    exportsDataDict[exportData.URL] = exportData;
                });
            });

        // Anomalies
        const anomaliesDataDict = {};
        const a = fs.readdirSync(join(Config.getAppOptions().uploadPath, "/Anomalies/"));
        a.map(name => ({
            name,
            time: fs
                .statSync(join(Config.getAppOptions().uploadPath, "/Anomalies/", name))
                .mtime.getTime(),
        }))
            .sort((a, b) => a.time - b.time)
            .forEach(file => {
                JSON.parse(
                    fs.readFileSync(
                        join(Config.getAppOptions().uploadPath, "/Anomalies/", file.name)
                    )
                ).forEach(anomalyData => {
                    anomaliesDataDict[anomalyData.URL] = anomalyData;
                });
            });

        return {
            Exports: Object.values(exportsDataDict),
            Anomalies: Object.values(anomaliesDataDict),
        };
    }
}

module.exports = DataReader;
