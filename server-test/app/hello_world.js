var express = require('express');
var app = express();
var generator = require('./generator');

app.get('/', function(req, res) {
    var number = req.query.number;
    var helloWorldArray = generator.generateHelloWorlds(number);
    res.status(200).send(JSON.stringify(helloWorldArray));
    //res.status(200).send('request number ' + number);
})

module.exports = app;

//app.listen(3000);
