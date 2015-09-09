var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/nickname', function(req, res, next) {
    console.log('nickname');

    res.render('nickname', { title: 'Nickname' });
});

module.exports = router;
