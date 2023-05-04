/**
 * RUNNING CLASSES
 *
 * @typedef {Object} Page
 * @property {string} name Page name
 * @property {string} url Page URL
 * @property {Array<string>} tags Page tags
 * @property {string} screenshot Base-64 formatted screenshot of the page
 *
 * @typedef {Object} Content
 * @property {string} name Content name
 * @property {string} id Content id
 * @property {string} type Content type
 * @property {string} url Content url
 * @property {Array<Page>} pages Content pages
 * @property {boolean} isError Content has error
 * @property {string | undefined} errorReason Content error reason
 * @property {boolean} scrap Does the scraper process this content
 * @property {boolean} screenshot Does the scraper screenshot this content
 *
 * @typedef {Object} Workspace
 * @property {string} name Workspace Name
 * @property {string} id Workspace ID
 * @property {string | null} icon Workspace icon URL
 * @property {Array<Content>} contents Workspace contents
 * @property {boolean} screenshot Does the scraper screenshot this workspace
 * @property {boolean} contentLevel Are the settings content-specific
 *
 *
 * CONFIG CLASSES
 *
 * @typedef {Array<Workspace>} ProcessCfg
 *
 * @typedef {Array<ProcessCfg>} RunOptions
 *
 *
 * DISCOVERY CLASSES
 *
 * @typedef {Object} ContentDsc
 * @property {string} id Content id
 * @property {string} name Content name
 * @property {string} type Content type
 *
 * @typedef {Object} WorkspaceDsc
 * @property {string} id Workspace ID
 * @property {string} name Workspace Name
 * @property {string | null} icon Workspace icon URL
 * @property {Array<ContentDsc>} contents Workspace contents
 *
 */
