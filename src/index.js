window.onload = function() {
  var haruConfig = {
    model: "./assets/haru/haru_02.moc",
    modelMode: "2",
    textures: [
      "assets/haru/haru_02.1024/texture_00.png",
      "assets/haru/haru_02.1024/texture_01.png",
      "assets/haru/haru_02.1024/texture_02.png"
    ]
  };

  var motions = [
    {
      id: "sing",
      path: "assets/haru/motions/idle_01.json"
    },
    {
      id: "smile",
      path: "assets/haru/motions/idle_00.json"
    },
    {
      id: "unknown",
      path: "assets/haru/motions/idle_02.json"
    }
  ];

  var canvas = document.getElementById("haru");
  var haru = null;
  let armMode = 0;
  var motionMgr = new MotionManager(motions);

  function initHaru() {
    haru = new Haru(haruConfig, canvas, motionMgr);
    haru.init().then(() => {
      haru.enableLookAtMouse();
      haru.setArmMode(armMode);
      canvas.addEventListener("click", function() {
        haru.setArmMode(armMode % 2 === 0);
        armMode++;
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

  window.addEventListener("resize", function() {
    resize();
  });

  resize();

  motionMgr
    .init()
    .then(initHaru)
    .then(() => setInterval(() => motionMgr.next(), 5000));

  function animate() {
    if (haru != null) {
      haru.update();
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
