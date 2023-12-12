const express = require("express");
const telegram = require('./handlers/telegram');
const mqttHttp = require('./handlers/mqtt_http');
const users = require('./handlers/users');
const config = require('./handlers/config')

const app = express();

app.use('/notifications', telegram);
app.use('/mqtt-http', mqttHttp);
app.use('/users', users);
app.use('/config', config)

app.listen(4200, () => console.log('Running green-sense-api at port 4200'))