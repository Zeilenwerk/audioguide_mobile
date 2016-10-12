var Network = {

  // Überprüfe Netzwerkstatus
  checkNetwork: function(online, offline) {
    console.log('checkNetwork function');
    var networkState = navigator.connection.type;
    if (networkState === Connection.NONE) {
      offline();
    } else {
      online();
    }
  },

  onUpdateAvailable: function(updateAvailable, noUpdate) {
    onOnline = function() {
      console.log('[UPDATE] getting api data');
      Network.get(URL, function(newData) {
        if (newData.updated_at !== Cache.updatedAt()) {
          updateAvailable(newData);
        } else {
          noUpdate();
        }
      }, function() { console.log('net failed'); });
    };

    var onOffline = function() {
      noUpdate();
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
      var parser = new DOMParser();
      var newContent = parser.parseFromString(this.responseText, 'text/html').querySelector('.main');

      callback(newContent, filename);
    });
    req.open('GET', url);
    req.send();
  }
};
