const fs = require("fs");
const Config = require("./Config");
const Logger = require("./Logger");
const regexpf = require("../shared/regexp").format;
const { join } = require("path");

/**
 * @class
 * @public
 */
class Uploader {
    /**
     * Upload the data for `workspace`
     * @param {Workspace} workspace
     * @public
     * @static
     */
    static upload(workspace) {
        try {
            const out_a = [];
            const out_c = [];

            for (const content of workspace.contents) {
                if (content.isError) {
                    out_a.push({
                        WorkspaceId: workspace.id,
                        WorkspaceName: workspace.name,
                        WorkspaceIcon:
                            workspace.icon !== null
                                ? workspace.icon
                                : "https://content.powerapps.com/resource/powerbiwfe/images/spinner-PBI-logo.6434e0fca135a582c323.svg",
                        ContentId: content.id,
                        ContentName: content.name,
                        ContentType: content.type,
                        URL: content.url,
                        Reason: content.errorReason,
                    });
                } else {
                    for (const page of content.pages) {
                        out_c.push({
                            WorkspaceId: workspace.id,
                            WorkspaceName: workspace.name,
                            WorkspaceIcon:
                                workspace.icon !== null
                                    ? workspace.icon
                                    : "https://content.powerapps.com/resource/powerbiwfe/images/spinner-PBI-logo.6434e0fca135a582c323.svg",
                            ContentId: content.id,
                            ContentName: content.name,
                            ContentType: content.type,
                            PageId: page.id,
                            PageName: page.name,
                            URL: page.url,
                            Tags: page.tags.join(";"),
                            Screenshot: "data:image/jpeg;base64," + page.screenshot,
                        });
                    }
                }
            }

            // Date vars
            const date = new Date();

            const fdate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            const ftime = `${date.getHours()}h-${date.getMinutes()}m-${date.getSeconds()}s`;

            // Global exports
            for (const p of Config.getAppOptions().globalPaths.exports) {
                fs.writeFileSync(
                    join(
                        p.path,
                        regexpf(p.format, {
                            date: fdate,
                            time: ftime,
                            workspaceId: workspace.id,
                            workspaceName: workspace.name,
                        })
                    ),
                    JSON.stringify(out_c, null, 4),
                    "utf8"
                );
            }

            // Global anomalies
            for (const p of Config.getAppOptions().globalPaths.anomalies) {
                fs.writeFileSync(
                    join(
                        p.path,
                        regexpf(p.format, {
                            date: fdate,
                            time: ftime,
                            workspaceId: workspace.id,
                            workspaceName: workspace.name,
                        })
                    ),
                    JSON.stringify(out_a, null, 4),
                    "utf8"
                );
            }

            // Workspace exports
            for (const p of workspace.paths.exports) {
                fs.writeFileSync(
                    join(
                        p.path,
                        regexpf(p.format, {
                            date: fdate,
                            time: ftime,
                            workspaceId: workspace.id,
                            workspaceName: workspace.name,
                        })
                    ),
                    JSON.stringify(out_c, null, 4),
                    "utf8"
                );
            }

            // Workspace anomalies
            for (const p of workspace.paths.anomalies) {
                fs.writeFileSync(
                    join(
                        p.path,
                        regexpf(p.format, {
                            date: fdate,
                            time: ftime,
                            workspaceId: workspace.id,
                            workspaceName: workspace.name,
                        })
                    ),
                    JSON.stringify(out_a, null, 4),
                    "utf8"
                );
            }
        } catch ({ name, message }) {
            Logger.error(`${workspace.name} > ${name} : ${message}`);
        }
    }
}

module.exports = Uploader;
