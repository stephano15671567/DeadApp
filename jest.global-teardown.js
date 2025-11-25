const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  // Try to clean up any mongod processes spawned by mongodb-memory-server on Windows.
  // This is a best-effort cleanup: in CI (Linux) this is usually not necessary.
  try {
    if (process.platform === 'win32') {
      // Attempt to kill mongod processes (forcefully). Requires appropriate permissions.
      try {
        execSync('taskkill /IM mongod.exe /F', { stdio: 'ignore' });
      } catch (err) {
        // If taskkill fails, fall back to scanning .jest_tmp for possible PIDs
        // (best-effort), but do not throw to avoid failing the test run.
        try {
          const repoTmp = path.resolve(__dirname, '.jest_tmp');
          const mongodTmp = path.join(repoTmp, 'mongodb');
          if (fs.existsSync(mongodTmp)) {
            // nothing specific to do here, taskkill is preferred
          }
        } catch (e) {
          // ignore
        }
      }
    } else {
      // On non-Windows we rely on normal stop(). Nothing to do here.
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Global teardown: could not fully clean mongod processes:', e.message || e);
  }
};
