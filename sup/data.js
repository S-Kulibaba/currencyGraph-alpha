const express = require('express');
const app = express();
const port = 3001;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

app.use(cors());

//saving files

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const currencyId = req.params.currencyId;
    cb(null, `uploads/${currencyId}/`);
  },
  filename: (req, file, cb) => {
    const currentDate = new Date().toISOString().slice(0, 10);
    const fileName = `${path.basename(
      file.originalname,
      path.extname(file.originalname)
    )}_${currentDate}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

app.post('/upload/:currencyId', upload.single('file'), (req, res) => {
  console.log(`Received ${req.params.currencyId} file:`, req.file);

  const currencyId = req.params.currencyId;

  // array from currentRate for currency
  function getCurrencyRates() {
    const currencyPath = path.join(__dirname, `uploads/${currencyId}`);
    const files = fs.readdirSync(currencyPath);

    const rates = [];

    files.forEach(file => {
      const filePath = path.join(currencyPath, file);
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileData);

      if (jsonData.hasOwnProperty('currentRate')) {
        rates.push(jsonData.currentRate);
      }
    });

    return rates;
  }

  const rates = getCurrencyRates(); // creating array currentRate
  console.log(`${currencyId} Rates:`, rates);

  res.status(200).json({ rates }); // array like answer for post
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
