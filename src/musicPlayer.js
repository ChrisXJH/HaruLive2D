function MusicPlayer(htmlSource) {

    this.listeners = [];

    this.htmlSource = htmlSource;

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    this.analyser = this.audioCtx.createAnalyser();

    this.oscillator = this.audioCtx.createOscillator();

    this.source = this.audioCtx.createMediaElementSource(this.htmlSource);

    this.NOTIFY_INTERVAL = 50;
    
    this.initStream();

    this.startNotify();

}

MusicPlayer.prototype.initStream = function() {

    this.source.connect(this.analyser);

    this.analyser.connect(this.audioCtx.destination);

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

MusicPlayer.prototype.load = function(url) {

};

MusicPlayer.prototype.play = function() {

};