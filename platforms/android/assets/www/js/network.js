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
      get(URL, function(newData) {
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
  }
};
