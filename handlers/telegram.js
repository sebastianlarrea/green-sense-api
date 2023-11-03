const express = require("express");
const axios = require("axios");

const app = express();

const GREEN_SENSE_BOT = "6894083862:AAEfONTCMX6Yv7vnzyiNXUcZkHHwEy-i2LU";
const GROUP_ID = "-4083083811";

app.use(express.json());

app.post("/send-alert", async (req, res) => {
  await axios.post(
    `https://api.telegram.org/bot${GREEN_SENSE_BOT}/sendMessage?chat_id=${GROUP_ID}&text=${req.body.message}`
  ).then(() => res.send('OK'))
   .catch(error => res.json(error));
});

module.exports = app;
