var update = {
  initialize: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

  onDeviceReady: function() {
    debug('-- update.onDeviceReady');
    Cache.initializeCache(function(list) {
      Network.onUpdateAvailable(update.onUpdateAvailable, update.onNoUpdate, update.transferFailed);
    }, function(){
      navigator.notification.alert('Bitte öffnen Sie die App mit einer funktionierender Internetverbindung', function() {}, 'Hinweis',  'OK');
    });
  },

  transferFailed: function() {
    debug('-- update.transferFailed');
    console.log('[UPDATE] file transfer failed');
    var bar = document.querySelector('.progress-bar');
    bar.style.display = 'none';
    var p = document.querySelector('p');
    p.innerHTML = 'Aktualisierung fehlgeschlagen.<br>Bitte Internetverbindung überprüfen.';
    var button = document.querySelector('.reverse');
    button.style.display = 'block';
    button.addEventListener('click', function() {
      window.location.reload();
    });
  },

  onUpdateAvailable: function(newData) {
    debug('-- update.onUpdateAvailable -- execute update process');
    Cache.init(update.onCachingComplete, update.onCachingProgress);
    Cache.storeApiData(newData);
    Cache.storeSites();
  },

  onNoUpdate: function() {
    debug('-- update.onNoUpdate -- no update needed, redirect to start site');
    window.location.replace('index.html');
  },

  onCachingComplete: function() {
    debug('-- update.onCachingComplete -- update complete, redirect to start site');
    setTimeout(function() {
      window.location.replace('index.html');
    }, 2000);
  },

  onCachingProgress: function(e) {
    debug('-- update.onCachingProgress');
    console.log("Progress: " + (100/e.queueIndex*e.queueSize));
    var bar = document.querySelector('.progress-bar');
    bar.style.display = 'block';
    var span = document.querySelector('span');
    span.style.width = (100/e.queueIndex*e.queueSize) + '%';
  }
};

update.initialize();
