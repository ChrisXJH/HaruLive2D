window.onload = function() {

    var haruConfig = {
        "model" : "./assets/haru/haru_02.moc",
        "modelMode": "2",
        "textures" : [
            "assets/haru/haru_02.1024/texture_00.png",
            "assets/haru/haru_02.1024/texture_01.png",
            "assets/haru/haru_02.1024/texture_02.png"
        ]
    };

    var motions = [
        {
            "id" : "sing",
            "path" : "assets/haru/motions/idle_01.json"
        },
        {
            "id" : "smile",
            "path" : "assets/haru/motions/idle_00.json"
        },
        {
            "id" : "unknown",
            "path" : "assets/haru/motions/idle_02.json"
        }
    ];

    var canvas = document.getElementById("haru");





    // var vocalAudio = document.getElementById("vocal");

    // var song = document.getElementById("song");

    var haru = null;

    // var musicPlayer = new MusicPlayer();

    // musicPlayer.setVocal(vocalAudio);

    // musicPlayer.setSong(song);

    // musicPlayer.init();

    var smile = true;

    function initHaru() {

        haru = new Haru(haruConfig, canvas, function() {
            // haru.subscribe(musicPlayer);
            haru.enableLookAtMouse();
            haru.setMotion(motionMgr.getMotionById('smile'), true);
            haru.setArmMode(1);

            canvas.addEventListener('click', function() {
                if (smile) {
                    haru.setMotion(motionMgr.getMotionById('sing'), true);
                    haru.setArmMode(1);

                    smile = false;
                }
                else {
                    haru.setMotion(motionMgr.getMotionById('smile'), true);
                    haru.setArmMode(0);

                    smile = true;
                }
                // if (!musicPlayer.isPlaying()) {
                //     haru.setArmMode(0);
                //     musicPlayer.play(function () {
                //         haru.setMotion(motionMgr.getMotionById('smile'), true);
                //         haru.setArmMode(1);
                //     });
                // }
                // else {
                //     musicPlayer.stop();
                // }
            });
            animate();
        });
    }

    var RATIO = canvas.height / canvas.width;
    function resize() {
        canvas.height = window.innerHeight;
        canvas.width = canvas.height / RATIO;
        if (haru != null) haru.resize();
    }

    window.addEventListener('resize', function () {
        resize();
    });

    resize();

    var motionMgr = new MotionManager(motions, initHaru);

    function animate(seconds) {

        if (haru != null && haru.completed) {
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

};
