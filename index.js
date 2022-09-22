const dht = require("node-dht-sensor").promises;
const express = require("express");
const child = require("child_process");

const sensorType = 11;
const sensorPin = 4;

function initializeTemperatureSensor() {
  dht.setMaxRetries(10);
  dht.initialize(sensorType, sensorPin);
}

function cToF(c) {
  return Math.round(32 + (9 / 5) * c + Number.EPSILON);
}

initializeTemperatureSensor();

const app = express();
app.use(express.static("public"));
const port = 8080;

app.get("/dht", async (req, res) => {
  const { temperature, humidity } = await dht.read(sensorType, sensorPin);

  res.json({
    c: temperature,
    f: cToF(temperature),
    h: humidity,
  });
});

app.get("/fans/on", async (req, res) => {
  try {
    const stdout = child.execSync(`uhubctl -l 1-1 -p 2 -a 1`).toString();
    console.log(stdout);
    res.json({ on: true });
  } catch (e) {
    res.status(500);
  }
});

app.get("/fans/off", async (req, res) => {
  try {
    const stdout = child.execSync(`uhubctl -l 1-1 -p 2 -a 0`).toString();
    console.log(stdout);
    res.json({ on: false });
  } catch (e) {
    res.status(500);
  }
});

app.get("/fans", async (req, res) => {
  try {
    console.log("Attempting to get fan status");
    const result = child.execSync(`uhubctl -l 1-1 -p 2`).toString();
    const matches = result.match(/Port 2: (\d\d\d\d) (off|power)/);
    if (!matches || !matches[2]) {
      throw new Error("Cannot parse command output: " + result);
    }
    res.json({ on: matches[2] === "power" ? true : false });
  } catch (e) {
    console.error(e);
    res.status(500);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
