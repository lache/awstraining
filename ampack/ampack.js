'use strict';
const crypto = require('crypto');
const fs = require('fs');
const glob = require('glob');
const Q = require('q');

Q.nfcall(glob, '@(src|res|resext)/**/*.*').then(function(files) {
    let hashCalculated = 0;
    let fileHashDict = {};

    let manifest = {
        remoteVersionUrl: 'https://192.168.0.180:3443/assets/version.manifest',
        packageUrl: 'https://192.168.0.180:3443/assets/',
        remoteManifestUrl: 'https://192.168.0.180:3443/assets/project.manifest',
        version: '1.2.67',
        engineVersion: '3.8 ataxx',
    };

    manifest.assets = {};

    for (let i = 0; i < files.length; i++) {
        // the file you want to get the hash
        let fd = fs.createReadStream(files[i]);
        let hash = crypto.createHash('md5');
        hash.setEncoding('hex');

        fd.on('end', function() {
            hash.end();
            //console.log(files[i] + ':' + hash.read()); // the desired sha1sum
            //fileHashDict[files[i]] = hash.read();

            let h = hash.read();

            manifest.assets[files[i]] = h;

            hashCalculated++;

            if (hashCalculated == files.length) {
                var hashAcc = crypto.createHash('md5');
                hashAcc.setEncoding('hex');

                let keys = [];
                for (let key in manifest.assets) {
                    keys.push(key);
                }
                keys.sort();

                for (let j = 0; j < keys.length; j++) {
                    hashAcc.write(manifest.assets[keys[j]]);
                }

                hashAcc.end();

                manifest.version = Date.now() + '-' + hashAcc.read();

                // JSON.stringify 방식으로 화면에 보내면
                // 키-값 순서가 마음대로 변경되기 때문에,
                // 귀찮지만 수동으로 출력한다.
                let manifestString = '';
                manifestString += '{\n';
                manifestString += '    "remoteVersionUrl": "' + manifest.remoteVersionUrl + '",\n';
                manifestString += '    "packageUrl": "' + manifest.packageUrl + '",\n';
                manifestString += '    "remoteManifestUrl": "' + manifest.remoteManifestUrl + '",\n';
                manifestString += '    "version": "' + manifest.version + '",\n';
                manifestString += '    "engineVersion": "' + manifest.engineVersion;

                // 우선 version.manifest를 쓰고, 그 다음 project.manifest를 쓴다.
                fs.writeFile("version.manifest", manifestString + '"\n}\n', function(err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("The version manifest was saved!");
                });

                manifestString += '",\n'
                manifestString += '    "assets": {\n';
                for (let j = 0; j < keys.length; j++) {
                    let filename = keys[j];
                    manifestString += '        "' + filename + '": {"md5":"' + manifest.assets[filename] +
                        ((j === keys.length - 1) ? '"}' : '"},') + '\n';
                }
                manifestString += '    }\n';
                manifestString += '}\n';

                fs.writeFile("project.manifest", manifestString, function(err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("The project manifest was saved!");
                });

                //console.log(manifest);
                //console.log('Finished');
                //console.log(manifestString);
            }
        });

        // read all file and pipe it (write it) to the hash object
        fd.pipe(hash);
    }

    //console.log(files);

}).catch(function(error) {
    console.log('Error - ' + error);
});
