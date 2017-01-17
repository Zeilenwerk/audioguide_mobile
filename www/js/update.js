var update = {
  initialize: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

  onDeviceReady: function() {
    ImgCache.init(function () {
      Network.onUpdateAvailable(update.onUpdateAvailable, update.onNoUpdate, update.transferFailed);
    }, function () {
      navigator.notification.alert('Bitte öffnen Sie EasyGuide mit einer funktionierender Internetverbindung', function() {}, 'Hinweis',  'Mach ich');
    });
  },

  transferFailed: function() {
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
    console.log('[UPDATE] api != localstorage');
    Cache.init(update.onCachingComplete, update.onCachingProgress);
    Cache.storeApiData(newData);
    Cache.storeSites();
  },

  onNoUpdate: function() {
    console.log('[UPDATE] no update need, redirect to start site');
    window.location.replace('index.html');
  },

  onCachingComplete: function() {
    console.log('[UPDATE] update complete, redirect to start site');
    window.location.replace('index.html'); 
  },

  onCachingProgress: function(percent) {
    console.log("Progress: " + percent);
    var bar = document.querySelector('.progress-bar');
    bar.style.display = 'block';
    var span = document.querySelector('span');
    span.style.width = percent + '%';
  }
};

update.initialize();
