function get(url, callbackSuccess, callbackError) {
  var req = new XMLHttpRequest();
  req.open('GET', URL, true);
  req.onload = function(e) {
    if(req.readyState === 4) {
      if(req.status === 200 || req.status === 204) {
        callbackSuccess(JSON.parse(req.responseText));
      } else {
        callbackError(req.responseText);
      }
    }
  };
  req.onerror = function() {
    callbackError(req.responseText)
  };
  req.send(null);
}
