function Haru(config, canvas, animate) {

    this.config = config;
    
    this.live2DModel = null;
    
    this.canvas = canvas;

    this.gl = null;

    this.loadedTextures = [];

    this.completed = false;

    this.origin_x = 0;

    this.origin_y = 0;

    this.distance = this.canvas.width;

    this.armMode = 0;

    this.init();
    
};

Haru.prototype.init = function() {

    var _this = this;

    Live2D.init();

    _this.initWebGL();

    _this.initModel(function() {
        _this.initTextures();
        _this.initGLMatrix();
    });

};

Haru.prototype.initWebGL = function() {
    var gl = getWebGLContext(this.canvas);
    if (!gl) {
        console.error("Failed to create WebGL context.");
        return;
    }
    
    Live2D.setGL(gl)
    this.gl = gl;

};

Haru.prototype.isCompleted = function() {
    return this.completed;
};

Haru.prototype.draw = function() {
    var _this = this;
    _this.gl.clearColor( 0.0 , 0.0 , 0.0 , 0.0 );
    _this.gl.clear(_this.gl.COLOR_BUFFER_BIT);

    if (_this.loadedTextures != null) {
        for(var i = 0; i < _this.loadedTextures.length; i++ ){
                
            var texName = _this.createTexture(_this.loadedTextures[i]);

            _this.live2DModel.setTexture(i, texName); 
        }
        _this.loadedTextures = null;
    }

    

    // var t = UtSystem.getUserTimeMSec() * 0.001 * 2 * Math.PI; 
    // var cycle = 3.0;
    
    // _this.live2DModel.setParamFloat("PARAM_ANGLE_Y", 30 * Math.sin(t/cycle));
    // _this.live2DModel.setParamFloat("PARAM_EYE_R_OPEN", 1 * Math.sin(t/cycle));
    // _this.live2DModel.setParamFloat("PARAM_EYE_L_OPEN", 1 * Math.sin(t/cycle));
    

    _this.live2DModel.update(); 
    _this.live2DModel.draw();
};

Haru.prototype.enableLookAtMouse = function() {
    var _this = this;
    canvas.addEventListener('mousemove', function(e){
        if (haru.completed) {
            var x = e.clientX - _this.origin_x;
            var y = e.clientY + _this.origin_y;
            
            var angle_x = Math.atan(x / _this.distance) * 180;
            var angle_y = Math.atan(y / _this.distance) * 180;
            _this.live2DModel.setParamFloat("PARAM_ANGLE_X", angle_x);
            _this.live2DModel.setParamFloat("PARAM_ANGLE_Y", -angle_y);
        }
    });
};

Haru.prototype.setArmMode = function(mode) {
    var _this = this;
    if (mode == 0) {
        _this.live2DModel.setPartsOpacity("PARTS_01_ARM_L_A_001", 1);
        _this.live2DModel.setPartsOpacity("PARTS_01_ARM_R_A_001", 1);
        _this.live2DModel.setPartsOpacity("PARTS_01_ARM_L_B_001", 0);
        _this.live2DModel.setPartsOpacity("PARTS_01_ARM_R_B_001", 0);
    } else {
        _this.live2DModel.setPartsOpacity("PARTS_01_ARM_L_B_001", 1);
        _this.live2DModel.setPartsOpacity("PARTS_01_ARM_R_B_001", 1);
        _this.live2DModel.setPartsOpacity("PARTS_01_ARM_L_A_001", 0);
        _this.live2DModel.setPartsOpacity("PARTS_01_ARM_R_A_001", 0);
    }
};

Haru.prototype.initModel = function(callback) {
    if (this.config != null && this.config.model != null) {
        var _this = this;
        loadBytes(this.config.model, function(response) {
            _this.live2DModel = Live2DModelWebGL.loadModel(response);
            if (callback != null)
                callback();
        });
    }
    else {
        console.error("Model path missing in configuration.");
    }
};

Haru.prototype.initTextures = function() {
    if(this.config.textures != null) {
        var _this = this;
        var loadCount = 0;
        for (var i = 0; i < _this.config.textures.length; i++) {
            _this.loadedTextures[i] = new Image();
            _this.loadedTextures[i].src = _this.config.textures[i];
            _this.loadedTextures[i].onload = function() {
                if (++loadCount == _this.config.textures.length)
                    _this.completed = true;
            };
            _this.loadedTextures[i].onerror = function() {
                console.error("Failed to load image : " + _this.config.textures[i]);
            };
        }
    }
    else {
        console.error("Missing texture configuration.");
    }
};

Haru.prototype.loadTextures = function() {
    var _this = this;
    for(var i = 0; i < _this.loadedTextures.length; i++ ){
                
        var texName = _this.createTexture(_this.loadedTextures[i]);

        _this.live2DModel.setTexture(i, texName); 
    }
};

Haru.prototype.initGLMatrix = function() {
    var _this = this;
    var s = 2.0 / _this.live2DModel.getCanvasWidth();
    _this.origin_x = _this.canvas.width / 2;
    _this.origin_y = (-_this.canvas.height + 160) / 2;

    var matrix4x4 = [
        s, 0, 0, 0,
        0,-s, 0, 0,
        0, 0, 1, 0,
        -1, 1, 0, 1
    ];
    _this.live2DModel.setMatrix(matrix4x4);
}


// Helper functions

function getWebGLContext(canvas) {
    var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];

    var param = {
        alpha : true,
        premultipliedAlpha : true
    };

    for( var i = 0; i < NAMES.length; i++ ){
        try{
            var ctx = canvas.getContext( NAMES[i], param );
            if( ctx ) return ctx;
        }
        catch(e){}
    }
    return null;
};

function loadBytes(path, callback) {
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

Haru.prototype.createTexture = function(image) {

    var gl = this.gl;
    var texture = gl.createTexture(); 
    if ( !texture ){
        console.error("Failed to generate gl texture name.");
        return -1;
    }
    
    if(this.live2DModel.isPremultipliedAlpha() == false){
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);	
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D , texture );
    gl.texImage2D( gl.TEXTURE_2D , 0 , gl.RGBA , gl.RGBA , gl.UNSIGNED_BYTE , image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture( gl.TEXTURE_2D , null );

    return texture;
};