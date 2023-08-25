// Function to handle the click event on currency containers

let counter = 0;

function handleCurrencyClick(currencyId) {
  counter++;

  // Create a new container element
  const newContainer = document.createElement("div");
  newContainer.classList.add("container-for-graph"); // Add CSS class for styling
  
  // Append the new container to the body
  document.body.appendChild(newContainer);

  // Trigger a reflow to apply the initial styles before animating
  newContainer.offsetWidth; // This forces the browser to redraw

  // Add a class to start the animation
  newContainer.classList.add("container-for-graph-show");

  const ratesNum = document.createElement("div"); // Создаем вложенный div элемент
  newContainer.appendChild(ratesNum); // Добавляем вложенный div внутрь newContainer
  ratesNum.classList.add("rates-num");
  ratesNum.id = "rate-num-uah";

  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 500); // Здесь устанавливайте подходящую задержку
  });
}

// Add event listeners to currency containers
document.getElementById("btn-eur").addEventListener("click", function () {
  if (counter == 0) {
    handleCurrencyClick("eur").then(funcUpd);;
  }
});

document.getElementById("btn-uah").addEventListener("click", function () {
  if (counter == 0) {
    handleCurrencyClick("uah").then(funcUpd);;
  }
});

document.getElementById("btn-huf").addEventListener("click", function () {
  if (counter == 0) {
    handleCurrencyClick("huf").then(funcUpd);;
  }
});

// Rates (string at left corner)

const LINK = 'https://api.exchangerate-api.com/v4/latest/USD';
function funcUpd() {
  const RATENUM = document.getElementById('rate-num-uah'); // Получаем элемент здесь

  return fetch(LINK)
    .then(response => response.json())
    .then(data => {
      currentRate = data.rates.UAH;
      RATENUM.textContent = `Today 1 USD = ${currentRate} UAH`;
      return currentRate;
    })
    .catch(error => console.error(error));
}

const http = require('http');
const fs = require('fs');

function sendJsonData() {
    const data = fs.readFileSync('data.json');

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/submit',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Статус код ответа: ${res.statusCode}`);
    });

    req.on('error', (error) => {
        console.error(`Произошла ошибка: ${error}`);
    });

    req.write(data);
    req.end();
}

module.exports = sendJsonData;

// Вызов функции сразу после загрузки файла
