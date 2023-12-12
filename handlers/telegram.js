const express = require("express");
const axios = require("axios");
const { getTime } = require('../utils')

const app = express();

const GREEN_SENSE_BOT = "6894083862:AAEfONTCMX6Yv7vnzyiNXUcZkHHwEy-i2LU";
const GROUP_ID = "-4083083811";
const LAMBDA_URL = "6kt2kmo5uj.execute-api.us-east-2.amazonaws.com";

app.use(express.json());

function getMostRecentMeasure(data) {
  const elements = data.map(item => ({ ...item, time: new Date(`${item.time} UTC`) }));
  
  return elements
    .reduce((maxDate, current) => { return current.time > maxDate.time ? current : maxDate; }, elements[0]);
}

async function sendMeasure(req) {
  const { data } = await axios
  .get(`https://${LAMBDA_URL}/items/${req.body.topic}`, { auth: { username: "green-sense", password: "GREENSENSEPASSWORD" }})
  const values = data[req.body.topic];
  
  const { [req.body.value]: value } = getMostRecentMeasure(values);

  const [message1, message2] = req.body.message.split('#')
  return `[${getTime()}]: ${message1} ${Number(value[req.body.value]).toFixed(2)} ${message2 ?? ''}`
}

app.post("/send-notification", async (req, res) => {
  const { data } = await axios.get('http://localhost:4200/config/get-settings')
  if (req.body?.topic && req.body?.value && data.config.temperatureAndHumidity) { 
    const message = await sendMeasure(req);
    await axios.post(
      `https://api.telegram.org/bot${GREEN_SENSE_BOT}/sendMessage?chat_id=${GROUP_ID}&text=${message}`
    ).then(() => res.send('OK'))
     .catch(error => res.json(error));
  } else res.send('No')
});

app.post("/send-alert", async (req, res) => {
  const message = `[${getTime()}]: ${req.body.message}`
  await axios.post(
    `https://api.telegram.org/bot${GREEN_SENSE_BOT}/sendMessage?chat_id=${GROUP_ID}&text=${message}`
  ).then(() => res.send('OK'))
   .catch(error => res.json(error));
});

module.exports = app;
