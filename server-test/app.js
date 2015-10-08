var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var moment = require('moment');

var routes = require('./routes/index');
var users = require('./routes/users');
var devtools = require('./routes/devtools');
var world = require('./routes/world');
var releases = require('./routes/releases');
var devices = require('./routes/devices');
var rooms = require('./routes/rooms');
var tests = require('./routes/tests');

var Server = require('./lib/ataxx-server/Server');

var app = express();

app.server = new Server();
app.locals.moment = moment;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/devtools', devtools);
app.use('/world', world);
app.use('/devices', devices);
app.use('/releases', releases);
app.use('/rooms', rooms);
app.use('/tests', tests);
// 최신 클라이언트 애셋을 서버에서 직접 가져갈 수 있도록 한다.
app.use('/assets', express.static(path.join(__dirname, '..', 'clientjs')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
