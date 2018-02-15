function MusicPlayer() {

    this.listeners = [];

    this.vocalAudio = null;

    this.songAudio = null;

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    this.analyser = this.audioCtx.createAnalyser();

    this.oscillator = this.audioCtx.createOscillator();

    this.vocalSource = null;

    this.NOTIFY_INTERVAL = 10;

    this.playing = false;

}

MusicPlayer.prototype.setVocal = function(vocal) {
    this.vocalAudio = vocal;
};

MusicPlayer.prototype.setSong = function(song) {
    this.songAudio = song;
};

MusicPlayer.prototype.init = function() {

    this.vocalSource = this.audioCtx.createMediaElementSource(this.vocalAudio);

    this.playing = false;

    this.initStream();

    this.initEventListeners();

    this.startNotify();

};

MusicPlayer.prototype.initStream = function() {

    this.vocalSource.connect(this.analyser);

    // this.analyser.connect(this.audioCtx.destination);

    this.analyser.fftSize = 32;

};

MusicPlayer.prototype.initEventListeners = function() {
    var _this = this;

    this.songAudio.addEventListener('play', function() {
        _this.playing = true;
    });

    this.songAudio.addEventListener('pause', function() {
        _this.playing = false;
    });

    this.songAudio.addEventListener('ended', function() {
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
    this.vocalAudio.play();
    this.songAudio.play();
};

MusicPlayer.prototype.pause = function() {
    this.vocalAudio.pause();
    this.songAudio.pause();
};

MusicPlayer.prototype.stop = function() {
    this.vocalAudio.pause();
    this.songAudio.pause();
    this.vocalAudio.currentTime = 0;
    this.songAudio.currentTime = 0;
};

MusicPlayer.prototype.isPlaying = function() {
    return this.playing;
};

MusicPlayer.prototype.getAnalyser = function() {
    return this.analyser;
};