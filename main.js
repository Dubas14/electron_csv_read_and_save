const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { stringify } = require('csv-stringify')

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('file.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('login-success', (event, data) => {
  console.log(data)
  event.sender.send('user-data', data)
  mainWindow.loadFile('welcome.html').then(() => {
    mainWindow.webContents.send('user-data', data)
  })
})

ipcMain.on('logout', () => {
  mainWindow.loadFile('index.html')
})

ipcMain.on('read-csv', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'CSV Files', extensions: ['csv'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return
  }

  const csvFilePath = result.filePaths[0]
  const data = []

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      data.push(row)
    })
    .on('end', () => {
      event.reply('csv-content', { data })
    })
})

ipcMain.on('save-csv', async (event, updatedData) => {
  const result = await dialog.showSaveDialog({
    title: 'Save CSV',
    defaultPath: 'test.csv',
    filters: [{
      name: 'CSV Files', extensions: ['csv']
    }]
  })

  if (result.canceled) {
    return
  }

  const saveFilePath = result.filePath
  const headers = Object.keys(updatedData[0])

  stringify(updatedData, { header: true, columns: headers }, (err, output) => {
    if (err) {
      return
    }

    fs.writeFile(saveFilePath, output, (err) => {
      if (err) {
        event.reply('save-csv-result', { error: err.message })
      } else {
        event.reply('save-csv-result', { success: true })
      }
    })
  })

})
