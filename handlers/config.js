const express = require("express");
const fs = require('fs');

const FILEPATH = 'config.json';

const app = express();

app.use(express.json());

app.get('/get-settings', async (_, res) => {
    fs.readFile(FILEPATH, 'utf8', (err, data) => {
        if (err) {
          console.error('Error al leer el archivo:', err);
          return;
        }
      
        res.status(200).json(JSON.parse(data))
      });
  });

app.post('/update-settings', async (req, res) => {
    fs.readFile(FILEPATH, 'utf8', (err) => {
      if (err) {
        console.error('Error al leer el archivo:', err);
        return;
      }
    
      fs.writeFile(FILEPATH, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error al sobreescribir el archivo:', err);
          res.status(500);
        } else {
          console.log('Archivo JSON sobrescrito con éxito.');
          res.status(200).json({});
        }
      });
    });
});

module.exports = app;
