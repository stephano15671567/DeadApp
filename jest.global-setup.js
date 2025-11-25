const fs = require('fs');
const path = require('path');

module.exports = async () => {
  // Create a repo-local temp directory to avoid permission issues on Windows
  const repoTmp = path.resolve(__dirname, '.jest_tmp');
  const mongodTmp = path.join(repoTmp, 'mongodb');

  try {
    if (!fs.existsSync(repoTmp)) fs.mkdirSync(repoTmp, { recursive: true });
    if (!fs.existsSync(mongodTmp)) fs.mkdirSync(mongodTmp, { recursive: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Could not create jest temp directories:', err);
  }

  // mongodb-memory-server respects MONGOMS_DOWNLOAD_DIR for downloaded binaries
  process.env.MONGOMS_DOWNLOAD_DIR = mongodTmp;

  // Also set TMP/TEMP to the repo-local temp to avoid Windows permission problems
  process.env.TMP = repoTmp;
  process.env.TEMP = repoTmp;

  // If using other libs that read TMPDIR, set it as well
  process.env.TMPDIR = repoTmp;
};
