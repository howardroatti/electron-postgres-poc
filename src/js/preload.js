const { contextBridge, ipcRenderer } = require('electron');

console.log('preload.js loaded!');

contextBridge.exposeInMainWorld('api', {
  getSalesData: () => ipcRenderer.invoke('get-sales-data')
});