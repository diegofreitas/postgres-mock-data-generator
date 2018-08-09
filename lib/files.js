const fs = require('fs');
const path = require('path');

module.exports = {
  getCurrentDirectoryBase : () => {
    return path.basename(process.cwd());
  },

  saveSession : (sessionName, data, callback) =>{
    fs.writeFile(`sessionOutputs/${sessionName}` , data, 'utf8', callback);
  },

  loadSession: (sessionName, callback) => {
    return JSON.parse(fs.readFileSync(sessionName, 'utf8'));
  },


  directoryExists : (filePath) => {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch (err) {
      return false;
    }
  }
};