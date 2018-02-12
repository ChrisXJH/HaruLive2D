var haruConfig = {
    "model" : "./assets/haru/haru_01.moc",
    "textures" : [
        "assets/haru/haru_01.1024/texture_00.png",
        "assets/haru/haru_01.1024/texture_01.png",
        "assets/haru/haru_01.1024/texture_02.png"
    ]
};

var motions = [
    {
        "id" : "",
        "path" : "assets/haru/motions/idle_01.json"
    },
    {
        "id" : "",
        "path" : "assets/haru/motions/idle_02.json"
    }
];

var canvas = document.getElementById("haru");

var haru = null;

function initHaru() {
    
    haru = new Haru(haruConfig, canvas, function() {
        haru.enableLookAtMouse();
        haru.setMotion(motionMgr.next(), true);

        canvas.addEventListener('click', function() {
            haru.setMotion(motionMgr.next(), true);
        });
        animate();
    });
}






var motionMgr = new MotionManager(motions, initHaru);




function animate(seconds) {
    
    if (haru != null && haru.completed) {
        haru.setArmMode(1);
        haru.update(seconds);
        haru.draw();
    }

    var requestAnimationFrame = 
        window.requestAnimationFrame || 
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || 
        window.msRequestAnimationFrame;

    requestAnimationFrame(animate);

}

