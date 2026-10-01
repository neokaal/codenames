const fs = require('fs');
let customConfig = [];
const hasIgnoresFile = fs.existsSync('./eslint.ignores.cjs');

const globals = require('globals');

if (hasIgnoresFile) {
  const ignores = require('./eslint.ignores.cjs');
  customConfig.push({ignores});
}

customConfig.push({
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
});

module.exports = [...customConfig, ...require('gts')];
