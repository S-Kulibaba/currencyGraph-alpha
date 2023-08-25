const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

app.use(cors());

// files path
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});


const fs = require('fs');
const axios = require('axios');

const data = [1, 2, 3];
const jsonData = JSON.stringify(data);

// server

fs.writeFile('data.json', jsonData, (err) => {
  if (err) {
    console.error('Error writing JSON file:', err);
    return;
  }

  console.log('JSON file created successfully.');

  const serverPort = 3001;
  const serverUrl = `http://localhost:${serverPort}/`;

  axios.post(serverUrl, jsonData, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then((response) => {
    console.log('Data sent to server:', response.data);
  })
  .catch((error) => {
    console.error('Error sending data to server:', error);
  });
});
