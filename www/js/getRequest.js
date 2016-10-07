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

function getHTML(url) {
  var req = new XMLHttpRequest();
  req.addEventListener('load', function() {
    var parser = new DOMParser();
    var newContent = parser.parseFromString(this.responseText, 'text/html').querySelector('.main');
    var links = newContent.querySelectorAll('a');

    for (var i = 0; i < links.length; i++) {
      if (links[i].parentNode.className.indexOf('station-show-titel') > -1) {
        links[i].setAttribute('href', 'index.html');
      } else {
        var url = links[i].getAttribute('href');
        var id = url.split('/')[7];
        links[i].setAttribute('href', 'show.html?station_id=' + id);
      }
    }

    document.querySelector('.main').innerHTML = newContent.innerHTML;
  });
  req.open('GET', url);
  req.send();
}
