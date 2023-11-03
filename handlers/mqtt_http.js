const express = require("express");
const mqtt = require("mqtt");
const axios = require("axios");

const MQTT_OPTS = {
  host: "localhost",
  keepalive: 4,
  clean: true,
};

const GREEN_SENSE_EVENT = "green-sense-event";
const GREEN_SENSE_WRITE = "green-sense-write";

const client = mqtt.connect(`mqtt://${MQTT_OPTS.host}`, MQTT_OPTS);

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
      const values = message.toString().split(",");
      const [id, humidity, temperature] = values.map((value) => Number(value));
      if (topic === subscribedTopic) {
        axios
          .put(
            "https://n2tkphe7j6.execute-api.us-east-2.amazonaws.com/items",
            { id, humidity, temperature },
            {
              auth: { username: "green-sense", password: "GREENSENSEPASSWORD" },
            }
          )
          .then((response) =>
            console.log(
              "Se ha ejecutado la petición PUT, con respuesta:",
              response.data
            )
          );
      }
    });
  });
}

const app = express();

app.use(express.json());

app.post("/active-valve", (req, res) => {
  const { message } = req.body;
  mqttPublish(GREEN_SENSE_EVENT, message, true);
  res.send(`OK ${req.body}`);
});

mqttSubscribe(GREEN_SENSE_WRITE);

module.exports = app;