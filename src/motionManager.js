function MotionManager(motionConfig, callback) {

    this.motionConfig = motionConfig;

    this.motionStack = [];

    this.ready = false;

    this.currentMotion = 0;
    
    this.loadMotions(callback);

}

function Motion(config) {
    
    this.fps = config.fps;

    this.params = config.params;

    this.currentStepIndex = 0;

}


MotionManager.prototype.loadMotions = function(callback) {
    var _this = this;
    
    if (_this.motionConfig != null) {
        var loadCount = 0;
        for(var i = 0; i < _this.motionConfig.length; i++) {
            Utils.loadJSON(_this.motionConfig[i].path, function(res) {
                if (res != null) {
                    _this.motionStack.push(res);
                    
                    if (++loadCount == _this.motionConfig.length) {
                        _this.ready = true;
                        if (callback != null) callback();
                    }
                }
            });
        }
    }
};

MotionManager.prototype.getMotion = function(index) {
    
    if (index < 0 || index >= this.motionStack.length){
        return null;
    }
    else {
        return new Motion(this.motionStack[index]);
    }
};

MotionManager.prototype.getMotionById = function(id) {
    var _this = this;
    for (var i = 0; i < _this.motionStack.length; i++) {
        if (_this.motionStack[i].id == id)
            return _this.getMotion(i);
    }
};

MotionManager.prototype.isReady = function() {
    return this.ready;
};

MotionManager.prototype.next = function() {
    var rtn = this.getMotion(++this.currentMotion);
    if (rtn == null) {
        this.currentMotion = 0;
        rtn = this.getMotion(this.currentMotion);
    }
    return rtn;
};

Motion.prototype.next = function() {
    var _this = this;
    var return_params = null;
    for (var key in _this.params) {
        if (_this.params[key] != null && _this.params[key][_this.currentStepIndex] != null) {
            if (return_params == null)
                return_params = {};
            return_params[key] = _this.params[key][_this.currentStepIndex];
        }
    }
    ++_this.currentStepIndex;
    return return_params;
};

Motion.prototype.reset = function() {
    this.currentStepIndex = 0;
};