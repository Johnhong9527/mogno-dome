const fs = require('fs');
const _path = require('path');
const _moment = require('moment');
module.exports = {
  ifExists(path, file = true) {
    const logPath = _path.resolve(path);
    const ifLogPath = fs.existsSync(logPath);
    if (!ifLogPath) {
      if (file) {
        fs.writeFileSync(logPath, '');
      } else {
        fs.mkdirSync(logPath);
      }
    }
  },
  writeFile(err) {
    this.ifExists('log', false);
    this.ifExists('log/log');
    const time = 'Error Time: ' + _moment().format('YYYY-MM-DD, h:mm:ss a');
    const message = time + '\n' + err.stack + '\n\n';
    fs.appendFileSync(_path.resolve('log/log'), message);
  },
};
