var Network = {

  checkNetwork: function(online, offline) {
    debug('-- Network.checkNetwork');
    var networkState = navigator.connection.type;
    if (networkState === Connection.NONE) {
      offline();
    } else {
      online();
    }
  },

  onUpdateAvailable: function(updateAvailable, noUpdate, noConnection) {
    debug('-- Network.onUpdateAvailable');
    var onOnline = function() {
      console.log('[NETWORK] getting api data');
      Network.get(APIHOST, function(newData) {
        console.log(newData.updated_at);
        if (newData.updated_at != localStorage.getItem("updated_at")) {
          console.log('[NETWORK] update is available');
          updateAvailable(newData);
        } else {
          noUpdate();
        }
      }, function() { console.log('net failed'); });
    };

    var onOffline = function() {
      noConnection();
    };

    Network.checkNetwork(onOnline, onOffline);
  },

  get: function(url, callbackSuccess, callbackError) {
    debug('-- Network.get');
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
      callbackError(req.responseText);
    };
    req.send(null);
  },

  getHTML: function(url, callback, filename) {
    debug('-- Network.getHTML');
    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
      var el = document.createElement('html');
      el.innerHTML = this.responseText;
      var newContent = el.querySelector('#main-wrapper');
      callback(newContent, filename);
    });
    req.open('GET', url);
    req.send();
  },

  getCss: function(url, callback, filename) {
    debug('-- Network.getCss');
    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
      callback(this.responseText, filename);
    });
    req.open('GET', url);
    req.send();
  },

  splitUrl: function(url) {
    debug('-- Network.splitUrl');
    return url.substring(url.lastIndexOf('/')+1, url.indexOf('?'));
  },

  imageUrlSplit: function(url) {
    debug('-- Network.imageUrlSplit for iOS');
    debug("Must split " + url);
    return url.split('(')[1].split(')')[0].replace('file://', '');
  }
};
