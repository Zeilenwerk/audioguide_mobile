var Network = {

  checkNetwork: function(online, offline) {
    console.log('checkNetwork function');
    var networkState = navigator.connection.type;
    if (networkState === Connection.NONE) {
      offline();
    } else {
      online();
    }
  },

  onUpdateAvailable: function(updateAvailable, noUpdate, noConnection) {
    var onOnline = function() {
      console.log('[NETWORK] getting api data');
      Network.get(URL, function(newData) {
        console.log(newData.updated_at);
        if (newData.updated_at !== Cache.updatedAt()) {
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
    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
      callback(this.responseText, filename);
    });
    req.open('GET', url);
    req.send();
  }
};
