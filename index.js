const express = require('express')

// Routes handler
var root = require('./root');
var nft = require('./nft');

var app = express();
const path = require('path')
const PORT = process.env.PORT || 3000
module.exports = app;

app.get("/", root.index);
app.get("/test", root.info);
app.get('/nft/info', nft.info);

// Let's listen
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))