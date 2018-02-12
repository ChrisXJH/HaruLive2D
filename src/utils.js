
function Utils() {}

Utils.loadJSON = function(url, callback) {
    var req = new XMLHttpRequest();
    req.responseType = 'json';
    req.onreadystatechange = function() {
        switch(req.status) {
            case 200 : {
                if (callback != null) callback(req.response);
                break;
            }
        }
    };
    req.open('GET', url, true);
    req.send();
}