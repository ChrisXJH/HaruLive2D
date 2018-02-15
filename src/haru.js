function Haru(config, canvas, callback) {

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

    this.currentMotion = {
        motion : null,
        repeat: false
    };


    this.MOUSE_TIME_OUT = 5000;

    this.mouseTimeout = null;

    this.mouse_x = 0;

    this.mouse_y = 0;

    this.mouseOut = true;

    this.waveMax = 0;

    this.lipValues = [];

    this.lipValDivisor = 100;

    this.init(callback);

    var _this = this;

};

Haru.prototype.init = function(callback) {

    var _this = this;

    Live2D.init();

    _this.initWebGL();

    _this.initModel(function() {
        
        _this.initTextures(function() {
            _this.initGLMatrix();
            
            if (callback != null)
                callback(_this);
        });
    });

};

Haru.prototype.initWebGL = function() {
    var gl = Utils.getWebGLContext(this.canvas);
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

Haru.prototype.update = function(seconds) {
    this.updateMotion();
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

    _this.live2DModel.update(); 
    _this.live2DModel.draw();
};

Haru.prototype.updateMotion = function() {
    if (this.currentMotion != null && this.currentMotion.motion != null) {
        var _this = this;
        var step = _this.currentMotion.motion.next();
        
        if (step == null && this.currentMotion.repeat)
            this.currentMotion.motion.reset();

        for (var key in step) {
            if (key == "PARAM_ANGLE_X" || key == "PARAM_ANGLE_Y" || key == "PARAM_EYE_BALL_X" || key == "PARAM_EYE_BALL_Y" || key == "PARAM_BODY_ANGLE_X") {
                if (!_this.mouseOut)
                    continue;
            }
            _this.setParam(key, step[key]);
        }
    }
};

Haru.prototype.updateMouth = function(mag) {
    if (mag == null) return;

    this.setParam('PARAM_MOUTH_OPEN_Y', mag);
    // TODO: will be used in singing feature
};

Haru.prototype.enableLookAtMouse = function() {
    var _this = this;

    _this.canvas.addEventListener('mousemove', function(e){
        clearTimeout(_this.mouseTimeout);
        // _this.mouse_x = e.clientX - _this.origin_x;
        // _this.mouse_y = e.clientY + _this.origin_y;
        _this.mouse_x = e.clientX;
        _this.mouse_y = e.clientY;
        _this.mouseOut = false;
        
        _this.updateFaceDirection();

        _this.mouseTimeout = setTimeout(function() {
            _this.resetMouse();
            clearTimeout(_this.mouseTimeout);
        }, _this.MOUSE_TIME_OUT);
    });

    _this.canvas.addEventListener('mouseout', function(e) {
        _this.resetMouse();

        _this.updateFaceDirection();
    });
};

Haru.prototype.resetMouse = function() {
    this.mouse_x = 0;
    this.mouse_y = 0;
    this.mouseOut = true;
};

Haru.prototype.updateFaceDirection = function() {
    var _this = this;
    if (haru.completed) {
        var midWidth = _this.canvas.width / 2;
        var midHeight = _this.canvas.height / 2;
        
        var dragX = (_this.mouse_x - midWidth) / midWidth;
        var dragY = (_this.mouse_y - midHeight + 100) / midHeight;
        
        // var angle_x = Math.atan(_this.mouse_x / _this.distance) * 180;
        // var angle_y = Math.atan(_this.mouse_y / _this.distance) * 180;
        var angle_x = dragX * 60;
        var angle_y = dragY * 60;
        _this.live2DModel.setParamFloat("PARAM_ANGLE_X", angle_x);
        _this.live2DModel.setParamFloat("PARAM_ANGLE_Y", -angle_y);
        _this.live2DModel.setParamFloat("PARAM_EYE_BALL_X", dragX / 2);
        _this.live2DModel.setParamFloat("PARAM_EYE_BALL_Y", -dragY / 2);
        _this.live2DModel.setParamFloat("PARAM_BODY_ANGLE_X", angle_x / 30);
    }
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

Haru.prototype.setMotion = function(motion, repeat) {
    this.currentMotion = {
        motion: motion,
        repeat: repeat
    };
};

Haru.prototype.initModel = function(callback) {
    
    if (this.config != null && this.config.model != null) {
        var _this = this;
        Utils.loadBytes(this.config.model, function(response) {      
            _this.live2DModel = Live2DModelWebGL.loadModel(response);
            if (callback != null)
                callback();
        });
    }
    else {
        console.error("Model path missing in configuration.");
    }
};

Haru.prototype.initTextures = function(callback) {
    if(this.config.textures != null) {
        var _this = this;
        var loadCount = 0;
        for (var i = 0; i < _this.config.textures.length; i++) {
            _this.loadedTextures[i] = new Image();
            _this.loadedTextures[i].src = _this.config.textures[i];
            _this.loadedTextures[i].onload = function(e) {
                if (++loadCount == _this.config.textures.length) {
                    
                    _this.completed = true;
                    if (callback != null)
                        callback(_this);
                }
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
    var multi = 2;
    var s = multi / _this.live2DModel.getCanvasWidth();
    _this.origin_x = _this.canvas.width / 2;
    _this.origin_y = (-_this.canvas.height + 160) / 2;

    var matrix4x4 = [
        s, 0, 0, 0,
        0,-s, 0, 0,
        0, 0, 1, 0,
        -(multi/2), multi/2, 0, 1
    ];
    _this.live2DModel.setMatrix(matrix4x4);
}


Haru.prototype.setParam = function(name, val) {
    this.live2DModel.setParamFloat(name, val);
};

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

Haru.prototype.subscribe = function(subject) {
    if (subject != null) subject.addListener(this);
};

Haru.prototype.notify = function(whoFrom) {
    var _this = this;
    var dataArray = whoFrom.getWaveInfo();
    var avg = (dataArray[9] + dataArray[10] + dataArray[11]) / 3;
    this.lipValues.push(avg);
    var lipValue = avg;

    if (this.lipValues.length >= 3) {
        lipValue = 0;
        this.lipValues = this.lipValues.slice(1);
       
        for (var i = 0; i < this.lipValues.length; i++) {
            lipValue += _this.lipValues[i];
        }
        lipValue /= this.lipValues.length;
        
    }

    if (lipValue > this.lipValDivisor + 20) {
        this.lipValDivisor -= 5;
    }
    else if (lipValue > this.lipValDivisor - 20) {
        this.lipValDivisor += 5;
    }

    var mouseMag = this.lipValDivisor > 0 ? lipValue / this.lipValDivisor : 0;
    
    this.updateMouth(mouseMag);

};
