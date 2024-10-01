const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  readCSV: () => ipcRenderer.send('read-csv'),
  onCSVContent: (callback) => ipcRenderer.on('csv-content', (event, args) => callback(args)),
  saveCSV: (data) => ipcRenderer.send('save-csv', data),
  onCSVSaveResult: (callback) => ipcRenderer.on('save-csv-result', (event, args) => callback(args)),
})
