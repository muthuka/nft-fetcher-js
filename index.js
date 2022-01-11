const express = require('express')
var app = express();
const path = require('path')
const PORT = process.env.PORT || 3000

app.get("/test", (req, res, next) => {
  res.json({
    "success": true
  });
});

// Let's listen
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))