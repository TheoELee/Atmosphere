var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.resolve('public/main.html'));
})

module.exports = router;
