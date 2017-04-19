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

    update.addWarningText('Aktualisierung fehlgeschlagen, bitte die Internetverbindung überprüfen [#ERR-TRANSFER]');
  },

  onUpdateAvailable: function(newData) {
    debug('-- update.onUpdateAvailable -- execute update process');
    Cache.init(update.onCachingComplete);
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
    }, 2 * 1000);
  },

  onCachingProgress: function(e) {
    debug('-- update.onCachingProgress');
    var percent = 100/e.queueIndex*e.queueSize;
    console.log("Progress: " + percent);
    var bar = document.querySelector('.progress-bar');
    bar.style.display = 'block';
    var span = document.querySelector('span');
    span.style.width = percent + '%';
  },

  addLoadingText: function(text){
    $('.logo-wrapper').addClass('loading');
    $('.status-text').text(text);
  },

  addWarningText: function(text){
    $('.logo-wrapper').removeClass('loading');
    $('.status-text').text(text);
    $('.reverse').show().click(function() {
      window.location.reload();
    });
  }
};

update.initialize();
