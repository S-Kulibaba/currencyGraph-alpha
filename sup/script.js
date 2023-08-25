const fs = require('fs');
const path = require('path');

function extractRatesFromJSONFiles(directoryPath, currency) {
    const files = fs.readdirSync(directoryPath);

    const rates = [];

    files.forEach(file => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(directoryPath, file);
            const jsonData = fs.readFileSync(filePath, 'utf8');

            try {
                const parsedData = JSON.parse(jsonData);
                if (parsedData.currency === currency && typeof parsedData.currentRate === 'number') {
                    rates.push(parsedData.currentRate);
                }
            } catch (error) {
                console.error(`Error parsing JSON file ${filePath}: ${error.message}`);
            }
        }
    });

    return rates;
}

const directoryPath = 'uploads/eur';
const currency = 'EUR';

const ratesArray = extractRatesFromJSONFiles(directoryPath, currency);
console.log(ratesArray);
