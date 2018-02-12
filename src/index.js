var haruConfig = {
    "model" : "./assets/haru/haru_01.moc",
    "textures" : [
        "assets/haru/haru_01.1024/texture_00.png",
        "assets/haru/haru_01.1024/texture_01.png",
        "assets/haru/haru_01.1024/texture_02.png"
    ]
};


var canvas = document.getElementById("haru");

var haru = new Haru(haruConfig, canvas);

haru.enableLookAtMouse();

(function animate() {
    if (haru.completed) {
        haru.setArmMode(1);
        haru.draw();
    }

    var requestAnimationFrame = 
        window.requestAnimationFrame || 
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || 
        window.msRequestAnimationFrame;

                
    requestAnimationFrame(animate);
    // requestAnimationFrame(animate);
})();

