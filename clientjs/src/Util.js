function EncodeQueryData(data) {
    var ret = [];
    for (var d in data) {
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
}

function Command(command, args) {
    return SERVER_URL + '/' + command + '?' + EncodeQueryData(args);
}

function RequestXhr(cmd, args, responseCmd, cb, cbOnError) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
            var httpStatus = xhr.statusText;
            var response = xhr.responseText.substring(0, 100) + '...';
            cc.log('GET Response (100 chars):)');
            cc.log(response);
            cc.log('Status: Got GET response! ' + httpStatus);
        } else {
            cc.log('onreadystatechange unknown result');
        }

        var r = JSON.parse(xhr.responseText);
        if (r.type === responseCmd) {
            cb(r);
        }
    }
    xhr.timeout = 5000;
    ['loadstart', 'abort', 'error', 'load', 'loadend', 'timeout'].forEach(function(eventname) {
        if ((eventname == 'error' || eventname == 'timeout') && cbOnError) {
            xhr['on' + eventname] = function() {
                cbOnError(eventname);
            }
        } else {
            xhr['on' + eventname] = function() {
                cc.log('\nEvent : ' + eventname);
            }
        }
    });
    xhr.open('GET', Command(cmd, args), true);
    xhr.send();
}

function PushScene(scene) {
    cc.director.pushScene(new cc.CCTransitionCrossFade(1, scene));
}
