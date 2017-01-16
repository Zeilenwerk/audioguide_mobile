var guide = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      window.addEventListener("resize", guide.hideScrollbar, true);

      StatusBar.hide();

      ImgCache.init(function () {

        if (Cache.empty()) {
          console.log('Cache is empty');
          guide.goToUpdate();
        }

        guide.displayData();

        Network.onUpdateAvailable(guide.displayUpdate, function(){}, function(){});

      }, function () {
        navigator.notification.alert('Bitte öffnen Sie die App mit einer funktionierender Internetverbindung', function() {}, 'Hinweis',  'OK');
      });
    },

    displayUpdate: function() {
      var box = document.querySelector('.update-box');
      box.style.display = 'block';
      box.addEventListener('click', guide.goToUpdate);
      var icon = document.querySelector('.close-icon');
      icon.addEventListener('click', function(e) {
        var box = document.querySelector('.update-box');
        box.style.display = 'none';
        e.stopPropagation();
      });
    },

    goToUpdate: function() {
      window.location.replace('update.html');
    },

    displayData: function() {
      console.log('displayData');
      var data = JSON.parse(localStorage.getItem('data'));
      Cache.readFile(data[0].url.split('/')[4].split('?')[0] + ".html", data, guide.onFileLoaded);
    },

    onFileLoaded: function(that, data) {
      document.querySelector('.main').innerHTML = that.result;

      var links = document.querySelectorAll('a');

      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', guide.onStationClick);
      }

      guide.hideScrollbar();
      guide.setHamburger();

      $('img,audio,video').each(function() {
          console.log('load cached files');
          ImgCache.useCachedFile($(this));
      });

      if (guide.hasBeacons()) {
          Beacon.startRangingBeacons();
        }
    },

    onStationClick: function(e) {
      var url = this.getAttribute('href');
      if(url !== null) {
        e.preventDefault();
        site.displayData(url);
      }
    },

    askLocationPermission: function() {
      cordova.dialogGPS("Dein GPS ist ausgeschaltet. Damit die App richtig funktionieren kann braucht es deine Position um Beacons um dich herum zu finden.",//message
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
      var beacons = false;

      var data = JSON.parse(localStorage.getItem('data'));

      for (i = 0; i < data.length; i++) {
        if (data[i].uuid !== "" && data[i].uuid !== null) {
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
      return device.version;
    },

    devicePlatform: function() {
      return device.platform;
    },

    checkBluetooth: function() {
      cordova.plugins.BluetoothStatus.initPlugin();
      if (!cordova.plugins.BluetoothStatus.BTenabled) {
        if(new Date() - guide.getLastAlert() > 1000 * 60 * 10) {
          guide.setLastAlert();
          navigator.notification.alert('Bitte schalten Sie Bluetooth ein damit EasyGuide iBeacons in Ihrer Nähe finden kann', function() {}, 'Hinweis',  'OK');
        }
      }
    },

    setLastAlert: function() {
      localStorage.setItem('bluetoothLastAlert', new Date().toISOString());
    },

    getLastAlert: function() {
      var last = localStorage.getItem('bluetoothLastAlert');
      if(last) {
        return Date.parse(last);
      } else {
        return (new Date()) - (1000 * 60 * 60 * 24);
      }
    },

    hideScrollbar: function() {
      if (document.querySelector('.menu-left')) {
        var width = document.querySelector('.menu-left').clientWidth;
        if(width > 0) {
          document.querySelector(".wrapper").style.marginLeft = (width - 100) + 'px';
        } else {
          document.querySelector(".wrapper").style.marginLeft = 0 + 'px';
        }
      }
    },

    setHamburger: function() {
      $('.app-hamburger').click(function(){
        $('.menu').toggleClass('open');
        $('.content-overlay').toggleClass('visible');
      });
      close_menu = function(){
        $('.menu').removeClass('open');
        $('.content-overlay').removeClass('visible');
      };
      $(window).resize(close_menu);
      $('.content-overlay').click(close_menu);
    }
};

guide.initialize();
