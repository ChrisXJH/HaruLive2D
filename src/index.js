var haruConfig = {
    "model" : "./assets/haru/haru_01.moc",
    "textures" : [
        "assets/haru/haru_01.1024/texture_00.png",
        "assets/haru/haru_01.1024/texture_01.png",
        "assets/haru/haru_01.1024/texture_02.png"
    ]
};

var conf_2 = {
    "model":"assets/Epsilon2.1/Epsilon2.1.moc",
    "textures":[
        "assets/Epsilon2.1/Epsilon2.1.2048/texture_00.png",
    ]
};





var canvas = document.getElementById("haru");

var haru = new Haru(haruConfig, canvas);

(function animate() {
    if (haru.isCompleted()) {
        haru.draw();
    }
    requestAnimationFrame(animate);
})();