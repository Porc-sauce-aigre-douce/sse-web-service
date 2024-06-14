const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const API_KEY = 'c1c04aad49c2a1ae152cf8b291c0f311';
const CITY = 'Montpellier'; // Change to your desired city
const INTERVAL = 60000; // Fetch weather data every 60 seconds

app.use(express.static('public'));

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendWeatherUpdate = async () => {
    try {
      console.log("Refreshing Data")
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`);
      const weatherData = response.data;
      const formattedData = {
        temperature: weatherData.main.temp,
        description: weatherData.weather[0].description,
        city: weatherData.name
      };
      res.write(`data: ${JSON.stringify(formattedData)}\n\n`);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.write(`data: ${JSON.stringify({ error: 'Error fetching weather data' })}\n\n`);
    }
  };

  sendWeatherUpdate(); // Initial fetch
  const intervalId = setInterval(sendWeatherUpdate, INTERVAL);

  req.on('close', () => {
    clearInterval(intervalId);
  });
});

app.listen(PORT, () => {
  console.log(`SSE server running on port ${PORT}`);
});