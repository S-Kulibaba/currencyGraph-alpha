const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const pgp = require('pg-promise')();
const cron = require('node-cron');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'rates_graph',
    password: '',
    port: 5432,
});

const db = pgp({
    database: 'rates_graph',
    user: 'postgres',
    password: '',
    port: 5432,
    host: 'localhost',
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function funcUpd(currencyId) {
    const LINK = 'https://api.exchangerate-api.com/v4/latest/USD';

    fetch(LINK)
        .then(response => response.json())
        .then(data => {
            let currentRate;
            if (currencyId === "EUR") {
                currentRate = data.rates.EUR;
            } else if (currencyId === "UAH") {
                currentRate = data.rates.UAH;
            } else if (currencyId === "HUF") {
                currentRate = data.rates.HUF;
            }

            const currentDate = new Date().toISOString().split('T')[0];

            const jsonData = {
                currencyId,
                currentRate,
                currentDate
            };

            console.log(jsonData);

            checkData(jsonData);
        })
        .catch(error => console.error(error));
}

function checkData(data) {
    const query = `
    WITH cte AS (
        SELECT currency_id, date
        FROM currency_rates
        WHERE currency_id = $1 AND date = $3
    )
    INSERT INTO currency_rates (currency_id, current_rate, date)
    SELECT $1, $2, $3
    WHERE NOT EXISTS (SELECT 1 FROM cte);      
    `;

    const values = [data.currencyId, data.currentRate, data.currentDate];

    pool.query(query, values, (error, result) => {
        if (error) {
            console.error('Error inserting data into PostgreSQL:', error);
        } else {
            console.log('Data inserted into PostgreSQL successfully:', result);
        }
    });
}

function getData(currency_id, res) {
    const query = 'SELECT * FROM currency_rates WHERE currency_id = $1 ORDER BY date ASC';

    db.any(query, currency_id)
        .then(data => {
            data.forEach(item => {
                const dateObject = new Date(item.date);
                item.date = dateObject.toISOString().split('T')[0];
            });

            data.forEach(item => delete item.id);

            res.json(data);
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error')
        });
}

app.post('/data', async (req, res) => {
    try {
        const requestData = req.body;
        console.log('Received data:', requestData);

        await checkData(requestData);
        getData(requestData.currencyId, res);
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send('Internal Server Error');
    }
});


const job = cron.schedule('*/1 * * * *', function() {
    funcUpd("EUR");
    funcUpd("UAH");
    funcUpd("HUF");
    console.log("Let's check it for...", "!");
});
job.start();

app.listen(port, '0.0.0.0', () => {
    console.log(`Server successfully running on port ${port}`);
});
