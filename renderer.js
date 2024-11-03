const { ipcRenderer } = require('electron');
const form = document.getElementById('login-form');

if (form) {
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const errorMessage = document.getElementById('error-message');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!username.value || !password.value) {
      errorMessage.innerText = 'Please enter username or password';
      return
    }
    fetch('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
      credentials: 'include'
    })
      .then(res => res.json())
      .then((data) => {
        if (!data.accessToken) {
          errorMessage.innerText = data.message
          return
        }
        localStorage.setItem('userData', JSON.stringify(data))
        ipcRenderer.send('login-success', data)
      }).catch((err) => {
        errorMessage.innerText = err.message
      })
  })
}


function getCurrentUser(token) {
  fetch('https://dummyjson.com/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Pass JWT via Authorization header
    },
    credentials: 'include' // Include cookies (e.g., accessToken) in the request
  })
    .then(res => res.json())
    .then((data) => {
      showWelcomeMessage(data)
      document.getElementById('profile-picture').src = data.image
    });
}


function showWelcomeMessage({ firstName, lastName }) {
  const welcomeMessage = document.getElementById('welcome-message')
  if (welcomeMessage) {
    welcomeMessage.innerText = `Welcome ${firstName} ${lastName}`
  }
}

const welcomeMessage = document.getElementById('welcome-message')
if (welcomeMessage) {
  if (!localStorage.getItem('userData')) {
    ipcRenderer.send('logout')
  } else {
    const userData = JSON.parse(localStorage.getItem('userData'))
    // showWelcomeMessage(userData)
    getCurrentUser(userData.accessToken)
  }
  ipcRenderer.on('user-data', (event, data) => {
    showWelcomeMessage(data)
  })
}

const logoutButton = document.getElementById('logout-button')
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    ipcRenderer.send('logout')
  })
}