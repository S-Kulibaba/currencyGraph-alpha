// handleCurrencyClick function

let counter = 0;

function handleCurrencyClick(currencyId) {
  counter++;

  // DOM editing
  const newContainer = document.createElement("div");
  newContainer.classList.add("container-for-graph");
  document.body.appendChild(newContainer);

  newContainer.offsetWidth;
  newContainer.classList.add("container-for-graph-show");

  const ratesNum = document.createElement("div");
  newContainer.appendChild(ratesNum);
  ratesNum.classList.add("rates-num");
  ratesNum.id = "rate-num-" + currencyId;

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(currencyId);
    }, 500);
  });
}

// HTTP 'POST'

function sendUpdateRequest(currencyId) {
  const serverUrl = `http://localhost:3001/upload/${currencyId}`;
  return fetch(serverUrl, {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    console.log(data.message);
  })
  .catch(error => console.error(error));
}

// Currency logic (eur, uah, huf)

document.getElementById("btn-eur").addEventListener("click", function () {
  if (counter == 0) {
    handleCurrencyClick("eur").then(() => {
      funcUpd("eur");
      sendUpdateRequest("eur");
    });
  }
});

document.getElementById("btn-uah").addEventListener("click", function () {
  if (counter == 0) {
    handleCurrencyClick("uah").then(() => {
      funcUpd("uah");
      sendUpdateRequest("uah");
    });
  }
});

document.getElementById("btn-huf").addEventListener("click", function () {
  if (counter == 0) {
    handleCurrencyClick("huf").then(() => {
      funcUpd("huf");
      sendUpdateRequest("huf");
    });
  }
});

// Chart func

function createChart(dataArray, dataDate, container) {
  // canvas elem
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  // graph
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dataDate,
      datasets: [
        {
          label: 'Currency Rates',
          data: dataArray,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

const LINK = 'https://api.exchangerate-api.com/v4/latest/USD'; // link for API

function funcUpd(currencyId) {
  const RATENUM = document.getElementById('rate-num-' + currencyId);

  let targetCurrency = '';
  if (currencyId === 'eur') {
    targetCurrency = 'EUR';
  } else if (currencyId === 'uah') {
    targetCurrency = 'UAH';
  } else if (currencyId === 'huf') {
    targetCurrency = 'HUF';
  }

  const currentDate = new Date();

  function addLeadingZero(num) {
    return num < 10 ? `0${num}` : num;
  }

  const formattedDate = `${addLeadingZero(currentDate.getDate())}-${addLeadingZero(currentDate.getMonth() + 1)}-${currentDate.getFullYear().toString().slice(-2)}`;

  return fetch(LINK)
    .then(response => response.json())
    .then(data => {
      const currentRate = data.rates[targetCurrency];
      RATENUM.textContent = `Today 1 USD = ${currentRate} ${targetCurrency}`;

      const jsonData = JSON.stringify({
        currencyId,
        currentRate,
        currentDate: formattedDate
      });
      const blob = new Blob([jsonData], { type: 'application/json' });

      const formData = new FormData();
      formData.append('file', blob, `currency_data_${currencyId}.json`);

      // server part
      return fetch('http://localhost:3001/upload/' + currencyId, {
        method: 'POST',
        body: formData
      });
    })
    .then(response => response.json()) // server answer
    .then(serverResponse => {
      const dataArray = Object.values(serverResponse.rates); // Transform the rates object into an array
      const dataDate = Object.values(serverResponse.dates);
      console.log('Server Response as Array:', dataArray);

      // chart creating
      createChart(dataArray, dataDate, RATENUM.parentElement);
    })
    .catch(error => console.error(error));
}
