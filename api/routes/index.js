var express = require('express');
var router = express.Router();
var path = require('path');
var clientPath = path.join(__dirname + '/../client/build/index.html');

router.get('/', (req, res) => {
  res.sendFile(clientPath);
  console.log("HOW AM I NOT IN HERE?!")
})

module.exports = router;
