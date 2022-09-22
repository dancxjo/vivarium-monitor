const dht = require('node-dht-sensor').promises
const express = require('express')

const sensorType = 11
const sensorPin = 4

function initializeTemperatureSensor() {
  dht.setMaxRetries(10)
  dht.initialize(sensorType, sensorPin)
}

function cToF(c) {
   return Math.round(((32 + (9/5 * c)) + Number.EPSILON))
}

  initializeTemperatureSensor()

  const app = express()
  const port = 8080

  app.get('/', async (req, res) => {
    const { temperature, humidity } = await dht.read(sensorType, sensorPin)

    res.json({
       c: temperature,
       f: cToF(temperature),
       h: humidity
    })
  })

  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
