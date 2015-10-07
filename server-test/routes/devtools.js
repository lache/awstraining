'use strict';
var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var shelljs = require('shelljs');
var os = require('os');
var firstIp = null;

router.get('/', function(req, res, next) {

    var ifaces = os.networkInterfaces();
    var ipAddrList = {};
    Object.keys(ifaces).forEach(function (ifname) {
      var alias = 0;

      ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }

        if (!firstIp) {
            firstIp = iface.address;
        }

        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          ipAddrList[ifname + ':' + alias] = iface.address;
        } else {
          // this interface has only one ipv4 adress
          ipAddrList[ifname] = iface.address;
        }
      });
    });

  res.render('devtools', { title: '개발도구', pwd: shelljs.pwd(), ipAddrList: ipAddrList });
});

router.post('/fastpublish', function(req, res, next) {
    let devHostName = 'charlie-dev';
    exec('cd .. && cd clientjs && node ..\\ampack\\ampack.js ' + devHostName, function(error, stdout, stderr) {
        var result = JSON.parse(stdout);
        res.render('fastpublish-result', { result });
    });
});

module.exports = router;
