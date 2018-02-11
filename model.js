var App = {};

App.live2DModel = null;

App.canvas = null;

App.loadModel = function(config, canvas, callback) {
    App.canvas = canvas;
    var model = config.model;
    loadBytes(model, function(buf) {
        App.live2DModel = Live2DModelWebGL.loadModel(buf);
        if (App.live2DModel == null) {
            console.error("Failed to load model.");
            return null;
        }
        else {
            // Load textures
            if (config.textures == null) {
                console.log("Textures missing in configuration.");
                return null;
            }
            else {
                for (var i = 0; i < config.textures.length; i++) {
                    App.live2DModel.setTexture(i, config.textures[i]);
                }
            }

            // Set WebGL context
            var ctx = getWebGLContext(App.canvas);
            if (ctx == null) {
                console.error("Failed to load WebGL context.");
            }
            else {
                Live2D.setGL(ctx);
            }

            if (callback != null) callback(App);
        }
    });
};

App.update = function() {
    App.live2DModel.update();
}



function getWebGLContext(canvas) {
    if (canvas == null) {
        console.error("Canvas is missing.");
        return null;
    }

    var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];

    for( var i = 0; i < NAMES.length; i++ ){
        try{
            var ctx = canvas.getContext(NAMES[i], {premultipliedAlpha : true});
            if(ctx) return ctx;
        }
        catch(e){}
    }
    return null;
};


function loadBytes(path, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = "arraybuffer";
    request.onload = function() {
        switch(request.status) {
            case 200:
                callback(request.response);
                break;
            default:
                var errorStr = "Failed to load (" + path + ") with http response code " + request.status + ".";
                console.error(errorStr);
                break;
        }
    }

    request.send(null);
}
