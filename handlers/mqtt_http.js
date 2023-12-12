const express = require("express");
const mqtt = require("mqtt");
const axios = require("axios");
const { postDataToClient } = require('../sockets/server');
const { getTime } = require('../utils')

const LAMBDA_URL = "6kt2kmo5uj.execute-api.us-east-2.amazonaws.com";

const MQTT_OPTS = {
  host: "172.20.10.4",
  keepalive: 4,
  clean: true,
  username: 'green-sense-user',
  password: 'greensense123'
};

const GREEN_SENSE_ACTIVE_VALVE = "green-sense-active-valve";
const GREEN_SENSE_READ_SENSORS = "green-sense-read-sensors";

const client = mqtt.connect(`mqtt://${MQTT_OPTS.host}`, MQTT_OPTS);
let flag = false;

function mqttPublish(topic, message, retain) {
  client.subscribe(topic, (err) => {
    if (!err) {
      client.publish(topic, message, { retain });
    }
  });
}

function mqttSubscribe(subscribedTopic) {
  client.on("connect", () => {
    client.subscribe(subscribedTopic);

    client.on("message", (topic, message) => {
      const values = message.toString('utf-8').split(",");
      const [id, temperature, air_humidity, humidity, level] = values.map((value) => Number(value));
      if (topic === subscribedTopic) {
        console.log({id, air_humidity, humidity, temperature, level});

        if (level === 0 && !flag) { 
          flag = true;
          axios.post('http://localhost:4200/notifications/send-alert', { message: 'The water tank is empty, please refill it.' }) 
        } 
        else if (level == 1 && flag) { 
          flag = false;
          axios.post('http://localhost:4200/notifications/send-alert', { message: 'Thank you for filling the tank, I love you very much.' })  
        }

        axios
        .put(
          `https://${LAMBDA_URL}/items`,
          { id, time: getTime(), air_humidity, temperature, humidity, level },
          {
            auth: { username: "green-sense", password: "GREENSENSEPASSWORD" },
          }
        )
        .then((response) => {
          postDataToClient({id, air_humidity, humidity, temperature, level})
          console.log(
            "Se ha ejecutado la petición PUT, con respuesta:",
            response.data
          )
        })
        .catch((error) => console.log(error));
      }
    });
  });
}

const app = express();

app.use(express.json());

app.post("/active-valve", (req, res) => {
  const { message } = req.body;
  mqttPublish(GREEN_SENSE_ACTIVE_VALVE, message, true);
  res.send(`OK ${req.body}`);
});

mqttSubscribe(GREEN_SENSE_READ_SENSORS);

module.exports = app;