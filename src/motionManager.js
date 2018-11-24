function MotionManager(motionConfig) {
  this.motionConfig = motionConfig;
  this.motionStack = [];
  this.currentMotion = 0;
}

function Motion(config) {
  this.id = config.id;
  this.fps = config.fps;
  this.params = config.params;
  this.currentStepIndex = 0;
}

MotionManager.prototype.init = function() {
  return Promise.all(
    this.motionConfig.map(config =>
      Utils.loadJSON(config.path).then(res =>
        this.motionStack.push(new Motion(res))
      )
    )
  );
};

MotionManager.prototype.getMotionById = function(id) {
  return this.motionStack.filter(motion => motion.id === id)[0];
};

MotionManager.prototype.next = function() {
  ++this.currentMotion;
  if (this.currentMotion >= this.motionStack.length) {
    this.currentMotion = 0;
  }
  return this.motionStack[this.currentMotion];
};

Motion.prototype.next = function() {
  var return_params = {};
  for (var key in this.params) {
    if (this.params[key] && this.params[key][this.currentStepIndex]) {
      return_params[key] = this.params[key][this.currentStepIndex];
    }
  }
  ++this.currentStepIndex;
  return return_params;
};

Motion.prototype.reset = function() {
  this.currentStepIndex = 0;
};
