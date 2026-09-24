// render.mjs selects one pinned Chrome Headless Shell explicitly (`prepare-browser`); Puppeteer's own
// install-time browser download would only add a second, unused browser.
module.exports = { skipDownload: true };
