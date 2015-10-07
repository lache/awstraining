'use strict';
const crypto = require('crypto');
const fs = require('fs');
const glob = require('glob');
const Q = require('q');
const _ = require('underscore');

// follow는 symlink 디렉토리 따라가도록 하기 위해서,
// mark는 디렉토리인 경우 맨 뒤에 '/' 문자를 추가로 붙이기 위해 켜는 옵션이다.
let options = {follow:true, mark:true};

Q.nfcall(glob, '@(src|res|resext|lib)/**/*.*', options).then(function(files) {
    let hashCalculated = 0;
    let fileHashDict = {};

    // print process.argv
    let host = process.argv[2];
    let baseAddr = 'https://' + host + ':3443/';

    let manifest = {
        remoteVersionUrl: baseAddr + 'assets/version.manifest',
        packageUrl: baseAddr + 'assets/',
        remoteManifestUrl: baseAddr + 'assets/project.manifest',
        version: '0.0.0', // 아래에서 계산됨
        engineVersion: '3.8 ataxx',
    };

    manifest.assets = {};

    // 디렉토리는 해싱 대상에서 빠져야한다.
    files = _.reject(files, s => s.endsWith('/'));

    for (let i = 0; i < files.length; i++) {
        //console.log(files[i]);

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
                fs.writeFileSync("version.manifest", manifestString + '"\n}\n');

                manifestString += '",\n'
                manifestString += '    "assets": {\n';
                for (let j = 0; j < keys.length; j++) {
                    let filename = keys[j];
                    manifestString += '        "' + filename + '": {"md5":"' + manifest.assets[filename] +
                        ((j === keys.length - 1) ? '"}' : '"},') + '\n';
                }
                manifestString += '    }\n';
                manifestString += '}\n';

                fs.writeFileSync("project.manifest", manifestString);

                //console.log(manifest);
                //console.log('Finished');
                //console.log(manifestString);

                console.log(JSON.stringify(manifest));
                console.log();
            }
        });

        // read all file and pipe it (write it) to the hash object
        fd.pipe(hash);
    }

    //console.log(files);

}).catch(function(error) {
    console.log(JSON.stringify(error));
}).done();
