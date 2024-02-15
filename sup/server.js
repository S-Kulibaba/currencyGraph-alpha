const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { Pool } = require('pg');
const pgp = require('pg-promise')();

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

let currentId;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/data', (req, res) => {
    const requestData = req.body;
    console.log('Recived data: ', requestData);

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

  const values = [requestData.currencyId, requestData.currentRate, requestData.currentDate];

pool.query(query, values, (error, result) => {
    if (error) {
        console.error('Error inserting data into PostgreSQL:', error);
        res.status(500).send('Internal Server Error');
        return;
    } else {
        console.log('Data inserted into PostgreSQL successfully:', result);
        currentId = requestData.currencyId;
        getData(currentId, res);
    }
  });
}); 

function getData(currency_id, res) {
const query = 'SELECT * FROM currency_rates WHERE currency_id = $1 ORDER BY date ASC';

db.any(query, currency_id)
  .then(data => {
    data.forEach(item => {
        const dateObject = new Date(item.date);
        item.date = dateObject.toISOString().split('T')[0];
    })

    data.forEach(item => delete item.id);

    const jsonData = JSON.stringify(data, null, 2);
    res.json(data);
  })
  .catch(error => {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error')
  })
}
app.listen(port, '0.0.0.0', () => {
    console.log(`Server successfully run on port ${port}`);
});

