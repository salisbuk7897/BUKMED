var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
require('./appserver/Models/db');
//require('./mongoRoutine');
var mainRouter = require('./appserver/Routes/mainRoute');
var updateRouter = require('./appserver/Routes/updateRoute');

var app = express();

app.use(session({
  key: 'user_sid',
  secret: 'bukmedsquebank',
  resave: false,
  saveUninitialized: false,
  cookie: {
      expires: 604800
  }
}));

app.use(function(req,res,next){
  res.locals.session = req.session;
  next();
});

app.post(function(req, res, next){
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', mainRouter);
app.use('/update', updateRouter);
app.use('/users', usersRouter);
app.use(express.static(path.join(__dirname,'uploads'))); 


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie('user_sid');        
  }
  next();
});

/*app.use(function(req,res,next){
  res.locals.user = req.session;
  next();
});*/

module.exports = app;
