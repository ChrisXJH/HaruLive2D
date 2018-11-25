function Haru(config, canvas, motionManager) {
  this.config = config;
  this.live2DModel = null;
  this.modelMode = config.modelMode != null ? config.modelMode : 1;
  this.canvas = canvas;
  this.gl = null;
  this.loadedTextures = [];
  this.origin_x = 0;
  this.origin_y = 0;
  this.armMode = 0;
  this.currentMotion = null;
  this.MOUSE_TIME_OUT = 5000;
  this.mouseTimeout = null;
  this.mouse_x = 0;
  this.mouse_y = 0;
  this.mouseOut = true;
  this.waveMax = 0;
  this.lipValues = [];
  this.lipValDivisor = 100;
  this.canvasOriginalHeight = this.canvas.height;
  this.motionManager = motionManager;
}

Haru.prototype.init = function() {
  Live2D.init();
  this.initWebGL();
  return this.initModel()
    .then(() => this.initTextures())
    .then(() => this.initGLMatrix());
};

Haru.prototype.initWebGL = function() {
  let gl = Utils.getWebGLContext(this.canvas);
  if (!gl) {
    console.error("Failed to create WebGL context.");
  } else {
    Live2D.setGL(gl);
    this.gl = gl;
  }
};

Haru.prototype.update = function() {
  this.updateMotion();
};

Haru.prototype.draw = function() {
  this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  if (this.loadedTextures) {
    let index = 0;
    this.loadedTextures.forEach(texture => {
      let textureName = this.createTexture(texture);
      this.live2DModel.setTexture(index++, textureName);
    });
    this.loadedTextures = null;
  }
  this.live2DModel.update();
  this.live2DModel.draw();
};

Haru.prototype.updateMotion = function() {
  this.currentMotion = this.motionManager.getCurrentMotion();
  let step = this.currentMotion.next();
  if (!step) this.currentMotion.reset();

  for (let key in step) {
    if (
      this.mouseOut ||
      !(
        key == "PARAM_ANGLE_X" ||
        key == "PARAM_ANGLE_Y" ||
        key == "PARAM_EYE_BALL_X" ||
        key == "PARAM_EYE_BALL_Y" ||
        key == "PARAM_BODY_ANGLE_X"
      )
    ) {
      this.setParam(key, step[key]);
    }
  }
};

Haru.prototype.updateMouth = function(mag) {
  this.setParam("PARAM_MOUTH_OPEN_Y", mag);
};

Haru.prototype.enableLookAtMouse = function() {
  this.canvas.addEventListener("mousemove", e => {
    clearTimeout(this.mouseTimeout);
    this.mouse_x = e.clientX;
    this.mouse_y = e.clientY;
    this.mouseOut = false;
    this.updateFaceDirection();
    this.mouseTimeout = setTimeout(() => {
      this.resetMouse();
      clearTimeout(this.mouseTimeout);
    }, this.MOUSE_TIME_OUT);
  });

  this.canvas.addEventListener("mouseout", e => {
    this.resetMouse();
    this.updateFaceDirection();
  });
};

Haru.prototype.resetMouse = function() {
  this.mouse_x = 0;
  this.mouse_y = 0;
  this.mouseOut = true;
};

Haru.prototype.updateFaceDirection = function() {
  let midWidth = this.canvas.width / 2;
  let midHeight = this.canvas.height / 2;
  let dragX = (this.mouse_x - midWidth) / midWidth;
  let dragY = (this.mouse_y - midHeight + this.canvas.height / 5) / midHeight;
  let angle_x = dragX * 60;
  let angle_y = dragY * 60;
  this.live2DModel.setParamFloat("PARAM_ANGLE_X", angle_x);
  this.live2DModel.setParamFloat("PARAM_ANGLE_Y", -angle_y);
  this.live2DModel.setParamFloat("PARAM_EYE_BALL_X", dragX / 2);
  this.live2DModel.setParamFloat("PARAM_EYE_BALL_Y", -dragY / 2);
  this.live2DModel.setParamFloat("PARAM_BODY_ANGLE_X", angle_x / 30);
};

Haru.prototype.setArmMode = function(mode) {
  if (mode == 0) {
    this.live2DModel.setPartsOpacity("PARTS_01_ARM_L_A_00" + this.modelMode, 1);
    this.live2DModel.setPartsOpacity("PARTS_01_ARM_R_A_00" + this.modelMode, 1);
    this.live2DModel.setPartsOpacity("PARTS_01_ARM_L_B_00" + this.modelMode, 0);
    this.live2DModel.setPartsOpacity("PARTS_01_ARM_R_B_00" + this.modelMode, 0);
  } else {
    this.live2DModel.setPartsOpacity("PARTS_01_ARM_L_B_00" + this.modelMode, 1);
    this.live2DModel.setPartsOpacity("PARTS_01_ARM_R_B_00" + this.modelMode, 1);
    this.live2DModel.setPartsOpacity("PARTS_01_ARM_L_A_00" + this.modelMode, 0);
    this.live2DModel.setPartsOpacity("PARTS_01_ARM_R_A_00" + this.modelMode, 0);
  }
};

Haru.prototype.setCurrentMotion = function(motion) {
  this.currentMotion = motion;
};

Haru.prototype.setMotionManager = function(motionManager) {
  this.motionManager = motionManager;
};

Haru.prototype.initModel = function() {
  return new Promise((resolve, reject) => {
    if (this.config && this.config.model) {
      Utils.loadBytes(this.config.model).then(response => {
        this.live2DModel = Live2DModelWebGL.loadModel(response);
        resolve();
      });
    } else {
      console.error("Model path missing in configuration.");
    }
  });
};

Haru.prototype.initTextures = function() {
  this.loadedTextures = this.config.textures.map(texture => {
    let textureImg = new Image();
    textureImg.src = texture;
    return textureImg;
  });

  return Promise.all(
    this.loadedTextures.map(
      texture => new Promise(resolve => (texture.onload = resolve))
    )
  );
};

Haru.prototype.loadTextures = function() {
  this.loadedTextures.forEach(texture => {
    let textureName = this.createTexture(this.loadedTextures[i]);
    this.live2DModel.setTexture(i, textureName);
  });
};

Haru.prototype.initGLMatrix = function() {
  let heightToOriginalHeight = this.canvas.height / this.canvasOriginalHeight;
  let scale = 1.5 * heightToOriginalHeight;
  let ratio = this.canvas.height / this.canvas.width;
  let s = scale / this.live2DModel.getCanvasWidth();
  this.origin_x = this.canvas.width / 2;
  this.origin_y = (-this.canvas.height + 160) / 2;

  let matrix4x4 = [
    s * ratio,
    0,
    0,
    0,
    0,
    -s,
    0,
    0,
    0,
    0,
    1,
    0,
    -1,
    1 * heightToOriginalHeight,
    0,
    1
  ];

  this.live2DModel.setMatrix(matrix4x4);
};

Haru.prototype.setParam = function(name, val) {
  this.live2DModel.setParamFloat(name, val);
};

Haru.prototype.createTexture = function(image) {
  let gl = this.gl;
  let texture = gl.createTexture();
  if (!texture) {
    console.error("Failed to generate gl texture name.");
    return null;
  }

  if (this.live2DModel.isPremultipliedAlpha() == false) {
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_NEAREST
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return texture;
};

Haru.prototype.subscribe = function(subject) {
  if (subject != null) subject.addListener(this);
};

Haru.prototype.notify = function(whoFrom) {
  let dataArray = whoFrom.getWaveInfo();
  let avg = (dataArray[9] + dataArray[10] + dataArray[11]) / 3;
  this.lipValues.push(avg);
  let lipValue = avg;

  if (this.lipValues.length >= 3) {
    lipValue = 0;
    this.lipValues = this.lipValues.slice(1);
    for (let i = 0; i < this.lipValues.length; i++) {
      lipValue += this.lipValues[i];
    }
    lipValue /= this.lipValues.length;
  }

  if (lipValue > this.lipValDivisor + 20) {
    this.lipValDivisor -= 5;
  } else if (lipValue > this.lipValDivisor - 20) {
    this.lipValDivisor += 5;
  }

  let mouseMag = this.lipValDivisor > 0 ? lipValue / this.lipValDivisor : 0;
  this.updateMouth(mouseMag);
};

Haru.prototype.resize = function() {
  this.initGLMatrix();
};
