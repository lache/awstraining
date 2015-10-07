'use strict';
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('releases', {title:'릴리즈'});
});

module.exports = router;
