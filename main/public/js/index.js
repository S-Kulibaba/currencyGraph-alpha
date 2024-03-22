import { buildGraphFunc } from "./graph.js";
import { CronJob } from 'cron';

const LINK = 'https://api.exchangerate-api.com/v4/latest/USD';

let counter = 0;
let currencyId;
let currentRate;
let previousData = null;

let RATENUM;

const rates = [];
const dates = [];

function handleCurrencyClick() {
  counter++;

  const newContainer = document.createElement("div");
  newContainer.classList.add("container-for-graph");
  
  document.body.appendChild(newContainer);


  newContainer.offsetWidth; 

  newContainer.classList.add("container-for-graph-show");

  const ratesNum = document.createElement("div");
  newContainer.appendChild(ratesNum);
  ratesNum.classList.add("rates-num");
  ratesNum.id = "rate-num-curr";

  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
      RATENUM = document.getElementById('rate-num-curr');
    }, 500);
  });
}

// Add event listeners to currency containers
document.getElementById("btn-eur").addEventListener("click", function () {
    if (counter == 0) {
        handleCurrencyClick("eur").then(() => {
            currencyId = "EUR";
            funcUpd(currencyId).then(() => {
            });
        });
    }
});

document.getElementById("btn-uah").addEventListener("click", function () {
    if (counter == 0) {
        handleCurrencyClick("uah").then(() => {
            currencyId = "UAH";
            funcUpd(currencyId).then(() => {
            });
        });
    }
});

document.getElementById("btn-huf").addEventListener("click", function () {
  if (counter == 0) {
    handleCurrencyClick("huf").then(() => {
        currencyId = "HUF";
        funcUpd(currencyId).then(() => {
        });
    });
    }
});

// Rates (string at the top)

function checkData(jsonData, currentRate) {
    if(previousData === null || jsonData !== previousData) {
        sendDataToServer(jsonData, currentRate);
        previousData = jsonData;
    }
}

function funcUpd(currencyId) {
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

        const currentDate = new Date().toISOString().split('T')[0];

        const jsonData = JSON.stringify({
            currencyId,
            currentRate,
            currentDate
        });
        
        console.log(jsonData);

        checkData(jsonData, currentRate)

    })
    .catch(error => console.error(error));
}

function sendDataToServer(jsonData, currentRate) {
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
            if(RATENUM) {
                RATENUM.textContent = `Today 1 USD = ${currentRate} ${currencyId}`;
                buildGraphFunc(rates, dates, RATENUM.parentElement)
            }
          })
          .catch(error => {
            console.error('Ошибка отправки:', error);
          });
    return currentRate;
}

function scheduleUpdate(currencyId) {
    const job = new cron.CronJob('0 * * * *', function() {
        console.log("Let's check it for...", currencyId + "!");
        funcUpd(currencyId);
    });
    job.start();
}

scheduleUpdate('EUR');
scheduleUpdate('UAH');
scheduleUpdate('HUF');
