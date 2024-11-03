const { ipcRenderer } = require('electron');

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(error => {
    console.error('Error accessing camera:', error);
  });

document.getElementById('snap').addEventListener('click', () => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataURL = canvas.toDataURL('image/png'); 
  ipcRenderer.send('camera-image', dataURL); 
});
