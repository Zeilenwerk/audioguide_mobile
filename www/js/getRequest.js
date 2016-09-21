function get(url, callbackSuccess, callbackError) {
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
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

// Fehlermeldung
function transferFailed() {
  console.log('Fehler beim Laden der Daten');
  var p = document.querySelector('p');
  p.innerHTML = 'Der Download neuer Inhalte ist leider fehlgeschlagen.<br> Ist der Gerät mit dem Internet verbunden?';
}
