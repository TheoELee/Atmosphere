var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var cookieParser = require('cookie-parser');

var app = express();
var clientPath = path.join(__dirname + '/../front-end/build/');

// Routes
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var callbackRouter = require('./routes/callback');
var mainRouter = require('./routes/main');
console.log("\nhttp://localhost:8888\n");

app.use(express.json())
   .use(express.urlencoded({ extended: false }))
   .use(cookieParser())
   .use(cors())
   .use(express.static(clientPath));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/callback', callbackRouter);
app.use('/main', mainRouter);

module.exports = app;
