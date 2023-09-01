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

  // Arrays for rates and dates
  const rates = [];
  const dates = [];

  function getCurrencyData() {
    const currencyPath = path.join(__dirname, `uploads/${currencyId}`);
    const files = fs.readdirSync(currencyPath);

    files.forEach(file => {
      const filePath = path.join(currencyPath, file);
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileData);

      if (jsonData.hasOwnProperty('currentRate') && jsonData.hasOwnProperty('currentDate')) {
        rates.push(jsonData.currentRate);
        dates.push(jsonData.currentDate);
      }
    });
  }

  getCurrencyData(); // Fill rates and dates arrays
  console.log(`${currencyId} Rates:`, rates);
  console.log(`${currencyId} Dates:`, dates);

  res.status(200).json({ rates, dates }); // Include both rates and dates in the response
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
