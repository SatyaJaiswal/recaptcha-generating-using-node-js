const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { stringify } = require('querystring');
const fs = require('fs').promises; // Add this line

const app = express();

app.use(express.json());

app.get('/', (_, res) => res.sendFile(__dirname + '/index.html'));

app.post('/contact', async (req, res) => {
  if (!req.body.captcha)
    return res.json({ success: false, msg: 'Please select captcha' });

  // Secret key
  const secretKey = '6LdpvDEUAAAAAHszsgB_nnal29BIKDsxwAqEbZzU';

  // Verify URL
  const query = stringify({
    secret: secretKey,
    response: req.body.captcha,
    remoteip: req.connection.remoteAddress
  });
  const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

  // Make a request to verifyURL
  const body = await fetch(verifyURL).then(res => res.json());

  // If not successful
  if (body.success !== undefined && !body.success)
    return res.json({ success: false, msg: 'Failed captcha verification' });

  // If successful
  const formData = req.body;
  saveFormData(formData);

  return res.json({ success: true, msg: 'Captcha passed' });
});

app.listen(8000, () => console.log('Server started on port 8000'));

function saveFormData(formData) {
  const dataFilePath = 'formData.json';

  // Read existing data from the file
  fs.readFile(dataFilePath)
    .then(data => {
      let existingData = [];
      try {
        existingData = JSON.parse(data);
      } catch (error) {
        console.error('Error reading existing data:', error);
      }

      // Add new form data
      existingData.push(formData);

      // Write updated data back to the file
      fs.writeFile(dataFilePath, JSON.stringify(existingData, null, 2));
    })
    .catch(error => {
      console.error('Error reading file:', error);
    });
}
