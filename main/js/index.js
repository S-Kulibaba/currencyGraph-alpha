import { buildGraphFunc } from "./graph.js";

// Function to handle the click event on currency containers
let counter = 0;
let currencyId;
let currentRate;

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
  ratesNum.id = "rate-num-curr";

  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 500); // Здесь устанавливайте подходящую задержку
  });
}

// Add event listeners to currency containers
document.getElementById("btn-eur").addEventListener("click", function () {
    if (counter == 0) {
        handleCurrencyClick("eur").then(() => {
            currencyId = "EUR";
            funcUpd();
        });
    }
});

document.getElementById("btn-uah").addEventListener("click", function () {
    if (counter == 0) {
        handleCurrencyClick("uah").then(() => {
            currencyId = "UAH";
            funcUpd();
        });
    }
});

document.getElementById("btn-huf").addEventListener("click", function () {
  if (counter == 0) {
    handleCurrencyClick("huf").then(() => {
        currencyId = "HUF";
        funcUpd();
    });
    }
});

// Rates (string at the top)

const LINK = 'https://api.exchangerate-api.com/v4/latest/USD';
function funcUpd() {
  const RATENUM = document.getElementById('rate-num-curr'); // Получаем элемент здесь

  return fetch(LINK)
    .then(response => response.json())
    .then(data => {
        if (currencyId === "EUR") {
            currentRate = data.rates.EUR;
        }
        else if (currencyId === "UAH") {
            currentRate = data.rates.UAH;
        }
        else if (currencyId === "HUF") {
            currentRate = data.rates.HUF;
        }

        const rates = [];
        const dates = [];

        const currentDate = new Date().toISOString().split('T')[0];

        const jsonData = JSON.stringify({
            currencyId,
            currentRate,
            currentDate
        });
        
        console.log(jsonData);
        RATENUM.textContent = `Today 1 USD = ${currentRate} ${currencyId}`;
        const server = 'http://localhost:3000/data';

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonData,
        };

        fetch(server, requestOptions)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Успешно отправлено:', data);
                data.forEach(item => {
                    rates.push(item.current_rate);
                    dates.push(item.date);
                })
                buildGraphFunc(rates, dates,  RATENUM.parentElement);
              })
              .catch(error => {
                console.error('Ошибка отправки:', error);
              });
        return currentRate;
    })
    .catch(error => console.error(error));
}