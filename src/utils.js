function Utils() {}

Utils.httpGet = function(url, responseType) {
  return new Promise((resolve, reject) => {
    var req = new XMLHttpRequest();
    req.responseType = responseType;
    req.onreadystatechange = function() {
      if (req.status && (req.status < 200 || req.status >= 300)) {
        reject("Failed to GET from: " + url);
      } else if (req.readyState == 4) {
        resolve(req.response);
      }
    };
    req.open("GET", url, true);
    req.send();
  });
};

Utils.loadJSON = function(url) {
  return this.httpGet(url, "json");
};

Utils.getWebGLContext = function(canvas) {
  var NAMES = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var param = {
    alpha: true,
    premultipliedAlpha: true
  };
  for (var i = 0; i < NAMES.length; i++) {
    try {
      var ctx = canvas.getContext(NAMES[i], param);
      if (ctx) return ctx;
    } catch (e) {}
  }
  return null;
};

Utils.loadBytes = function(url) {
  return this.httpGet(url, "arraybuffer");
};
