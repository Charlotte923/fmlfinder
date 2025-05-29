const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files in development
app.use(express.static(__dirname));

// Import the API handler
const proxyHandler = require('./api/proxy.js');

// Use the API handler for both production and development
app.get('/api/proxy', proxyHandler);

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
