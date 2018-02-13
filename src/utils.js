
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

Utils.getWebGLContext = function(canvas) {
    var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];

    var param = {
        alpha : true,
        premultipliedAlpha : true
    };

    for (var i = 0; i < NAMES.length; i++ ){
        try{
            var ctx = canvas.getContext( NAMES[i], param );
            if( ctx ) return ctx;
        }
        catch(e){}
    }
    return null;
};

Utils.loadBytes = function(path, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", path , true);
    request.responseType = "arraybuffer";
    request.onload = function(){
        switch( request.status ){
        case 200:
            if (callback != null)
                callback( request.response );
            break;
        default:
            console.error( "Failed to load (" + request.status + ") : " + path );
            break;
        }
    }

    request.send(null);
}