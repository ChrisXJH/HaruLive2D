function MusicPlayer(audio) {

    this.listeners = [];

    this.audio = audio;

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    this.analyser = this.audioCtx.createAnalyser();

    this.oscillator = this.audioCtx.createOscillator();

    this.source = this.audioCtx.createMediaElementSource(this.audio);

    this.NOTIFY_INTERVAL = 10;

    this.playing = false;

    
    this.initStream();

    this.initEventListeners();

    this.startNotify();

}

MusicPlayer.prototype.initStream = function() {

    this.source.connect(this.analyser);

    this.analyser.connect(this.audioCtx.destination);

    this.analyser.fftSize = 32;

};

MusicPlayer.prototype.initEventListeners = function() {
    var _this = this;

    this.audio.addEventListener('play', function() {
        _this.playing = true;
    });

    this.audio.addEventListener('pause', function() {
        _this.playing = false;
    });

    this.audio.addEventListener('ended', function() {
        _this.playing = false;
    });
};

MusicPlayer.prototype.startNotify = function() {
    var _this = this;
    var inv = setInterval(function() {
        for (var i = 0; i < _this.listeners.length; i++) {
            _this.listeners[i].notify(_this);
        }
    }, this.NOTIFY_INTERVAL);
};

MusicPlayer.prototype.getWaveInfo = function(index) {
    var dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return index != null ? dataArray[index] : dataArray;
};

MusicPlayer.prototype.addListener = function(listener) {

    this.listeners.push(listener);
    
};

MusicPlayer.prototype.play = function() {
    this.audio.play();
};

MusicPlayer.prototype.pause = function() {
    this.audio.pause();
};

MusicPlayer.prototype.isPlaying = function() {
    return this.playing;
};

MusicPlayer.prototype.getAnalyser = function() {
    return this.analyser;
};