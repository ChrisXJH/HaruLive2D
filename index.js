var haruConfig = {
    "model" : "./assets/haru/haru_01.moc",
    "textures" : [
        "assets/haru/haru_01.1024/texture_00.png",
        "assets/haru/haru_01.1024/texture_01.png",
        "assets/haru/haru_01.1024/texture_02.png"
    ]
};



Live2D.init();



var canvas = document.getElementById("haru");

App.loadModel(haruConfig, canvas, function(app) {
    app.update();
});