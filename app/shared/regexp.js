/**
 * @typedef {Object} FormatParams
 * @property {string|undefined} workspaceId Workspace id
 * @property {string|undefined} workspaceName Workspace name
 * @property {string|undefined} date Date
 * @property {string|undefined} time Time
 */

const keys = ["workspaceId", "workspaceName", "date", "time"];

const regexps = {
    workspaceId: /(?:{workspaceId})/g,
    workspaceName: /(?:{workspaceName})/g,
    date: /(?:{date})/g,
    time: /(?:{time})/g,
};

class RegExpFormatter {
    /**
     * Format `str` with given `params`
     * @param {string} str String to format
     * @param {FormatParams} params Parameters to use for formatting
     * @returns {string} Formatted string
     */
    static format = (str, params) => {
        for (const key of keys) {
            str = str.replace(regexps[key], params[key]);
        }
        return str;
    };
}

module.exports = RegExpFormatter;
