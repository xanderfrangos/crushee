const { ipcRenderer: ipc, remote } = require('electron');
const fs = require('fs');
const path = require('path');
const request = require('request');
const uuidv1 = require('uuid/v1');

// Temporary downloads folder
let tmpFolder = path.resolve(remote.app.getPath("userData"), "dl-tmp")
if(!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder)
}

const downloadFile = (url, dest, cb) => {

    let uuid = uuidv1()
    let tmpFile = tmpFolder + uuid + ".dat"
    while(fs.existsSync(tmpFile)) {
        uuid = uuidv1()
        tmpFile = tmpFolder + uuid + ".dat"
    }

    const file = fs.createWriteStream(tmpFile);
    const sendReq = request.get(url);

    // verify response code
    sendReq.on('response', (response) => {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }

        sendReq.pipe(file);
    });

    // close() is async, call cb after close completes
    file.on('finish', () => {
        file.close()
        if(fs.existsSync(dest)) {
            fs.unlinkSync(dest)
        }
        fs.copyFileSync(tmpFile, dest)
        cb("Finished downloading to: " + dest)
    });

    // check for request errors
    sendReq.on('error', (err) => {
        fs.unlink(tmpFolder);
        return cb(err.message);
    });

    file.on('error', (err) => { // Handle errors
        fs.unlink(tmpFolder); // Delete the file async. (But we don't check the result)
        return cb(err.message);
    });
};


window.electron = {
    download: downloadFile,
    setDockBadge,
}

ipc.on('markAllComplete', () => {
    // the todo app defines this function
    window.electron.markAllComplete();
  });


  function setDockBadge(count) {
    if(process.platform === 'darwin') {
      //Coerce count into a string. Passing an empty string makes the badge disappear.
      remote.app.dock.setBadge('' + (count || ''));
    }
  }

  console.log("PRELOAD SCRIPT")

