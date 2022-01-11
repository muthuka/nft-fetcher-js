const express = require('express')
var app = express();
const path = require('path')
const PORT = process.env.PORT || 3000

app.get("/", (req, res, next) => {
  res.send('Hello World!')
});

app.get("/test", (req, res, next) => {
  res.json({
    "success": true
  });
});

// Let's listen
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))