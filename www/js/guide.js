var guide = {
  initialize: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

  onDeviceReady: function() {
    debug('-- guide.onDeviceReady');
    window.addEventListener("resize", guide.hideScrollbar, true);

    StatusBar.hide();

    Cache.initializeCache(function(list) {
      debug('Cache.initializeCache callback');
      console.log(list);
      var data = Cache.getApiData();

      if (list.length <= 0 || data == null || localStorage.getItem("updated_at") != data.updated_at) {
        debug('Cache is empty');
        guide.goToUpdate();
      } else {
        debug('No update needed');
      }

      guide.displayData();

      Network.onUpdateAvailable(guide.displayUpdate, function(){}, function(){});
    }, function(){
        navigator.notification.alert('Bitte öffnen Sie die App mit einer funktionierender Internetverbindung', function() {}, 'Hinweis',  'OK');
    });
  },

  displayUpdate: function() {
    debug('-- guide.displayUpdate');
    if(typeof notify == "undefined"){
      guide.goToUpdate();
    }else{
      notify('Neue Inhalte sind verfügbar', guide.goToUpdate);
    }
  },

  goToUpdate: function() {
    debug('-- guide.goToUpdate');
    window.location.replace('update.html');
  },

  displayData: function() {
    debug('-- guide.displayData');
    var data = Cache.getApiData();
    Cache.readFile(Network.splitUrl(data.landing_page) + '.html', data, guide.onFileLoaded);
  },

  onFileLoaded: function(that, data) {
    debug('-- guide.onFileLoaded');
    $('.main').html(that.result);

    var links = document.querySelectorAll('a');

    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', guide.onStationClick);
    }

    guide.hideScrollbar();
    guide.loadCachedFiles();
  },

  loadCachedFiles: function() {
    debug('-- guide.loadCachedFiles');

    $('img, audio, video').each(function(i, e) {
      debug('loading cached file (img, audio, video)');
      $(e).attr('src', Cache.cache.get($(e).attr('src')));
    });

    $(document).find('.sw--background_image, .has-background-image').each(function(i, e) {
      debug('loading cached file (bg-image)');
      url = $(e).css('backgroundImage').replace(/url\("(.*?)"\)/g, '$1');
      $(e).css('backgroundImage', 'url("' + Cache.cache.get(url) + '")');
    });
  },

  onStationClick: function(e) {
    debug('-- guide.onStationClick');
    var url = this.getAttribute('href');
    if(url !== null) {
      e.preventDefault();
      site.displayData(Network.splitUrl(url) + '.html');
    }
  },

  askLocationPermission: function() {
    debug('-- guide.askLocationPermission');
    cordova.dialogGPS("Das GPS auf deinem Smartphone ist ausgeschaltet. Damit die App richtig funktionieren kann braucht es deine Position um Beacons um dich herum zu finden.",//message
        "Dies geht mit Wifi, Mobilen Daten oder Offline",
        function(buttonIndex){
          switch(buttonIndex) {
            case 0: break;
            case 1: break;
            case 2: break;
          }},
          "Einstellungen überprüfen",
          ["Abbrechen","Später","Zu den Einstellungen"]);
  },

  hasBeacons: function() {
    debug('-- guide.hasBeacons');
    var beacons = false;
    var data = Cache.getApiData();

    for (i = 0; i < data.posts.length; i++) {
      if (data.posts[i].uuid !== "" && data.posts[i].uuid !== null) {
        beacons = true;
      }
    }

    if (beacons) {
      if (guide.devicePlatform() === "Android" && guide.softwareVersion() >= "6.0") {
        guide.checkBluetooth();
        guide.askLocationPermission();
        return true;
      } else {
        guide.checkBluetooth();
        return true;
      }
    } else {
      return false;
    }
  },

  softwareVersion: function() {
    debug('-- guide.softwareVersion');
    return device.version;
  },

  devicePlatform: function() {
    debug('-- guide.devicePlatform');
    return device.platform;
  },

  checkBluetooth: function() {
    debug('-- guide.checkBluetooth');
    cordova.plugins.BluetoothStatus.initPlugin();
    if (!cordova.plugins.BluetoothStatus.BTenabled) {
      if(new Date() - guide.getLastAlert() > 1000 * 60 * 10) {
        guide.setLastAlert();
        navigator.notification.alert('Bitte schalten Sie Bluetooth ein damit die App Beacons in Ihrer Nähe finden kann', function() {}, 'Hinweis',  'OK');
      }
    }
  },

  setLastAlert: function() {
    debug('-- guide.setLastAlert');
    localStorage.setItem('bluetoothLastAlert', new Date().toISOString());
  },

  getLastAlert: function() {
    debug('-- guide.getLastAlert');
    var last = localStorage.getItem('bluetoothLastAlert');
    if(last) {
      return Date.parse(last);
    } else {
      return (new Date()) - (1000 * 60 * 60 * 24);
    }
  },

  hideScrollbar: function() {
    debug('-- guide.hideScrollbar');
    if (document.querySelector('.menu-left')) {
      var width = document.querySelector('.menu-left').clientWidth;
      if(width > 0) {
        document.querySelector(".wrapper").style.marginLeft = (width - 100) + 'px';
      } else {
        document.querySelector(".wrapper").style.marginLeft = 0 + 'px';
      }
    }
  }
};

guide.initialize();
