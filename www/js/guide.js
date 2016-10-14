var guide = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      cordova.plugins.BluetoothStatus.initPlugin();
      StatusBar.hide();

      ImgCache.init(function () {

        if (Cache.empty()) {
          guide.goToUpdate();
        }

        guide.displayData();

        Network.onUpdateAvailable(guide.displayUpdate, function(){}, function(){});

      }, function () {
        alert('Please check your internet connection and reopen the app');
      });
    },

    displayUpdate: function() {
      var box = document.querySelector('.update-box');
      box.style.display = 'block';
      box.addEventListener('touchend', guide.goToUpdate);
      var icon = document.querySelector('.close-icon');
      icon.addEventListener('touchend', function(e) {
        var box = document.querySelector('.update-box');
        box.style.display = 'none';
        e.stopPropagation();
      });
    },

    goToUpdate: function() {
      window.location.replace('update.html');
    },

    displayData: function() {
      console.log('displayData function');
      var data = JSON.parse(localStorage.getItem('data'));
      Cache.readFile('index.html', data, guide.onFileLoaded);
    },

    onFileLoaded: function(that, data) {
      document.querySelector('.main').innerHTML = that.result;

      var links = document.querySelectorAll('a');

      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('touchend', guide.onStationClick);
      }

      $('img,audio,video').each(function() {
          console.log('load cached files');
          ImgCache.useCachedFile($(this));
      });

      if (guide.hasBeacons()) {
          Beacon.startRangingBeacons();
        }
    },

    onStationClick: function(e) {
      var id = this.getAttribute('data-id');
      if(id !== null) {
        e.preventDefault();
        if (Number(id) === 0) {
          guide.displayData();
        } else {
          station.displayData(id);
        }
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

      for (i = 0; i < data.stations.length; i++) {
        if (data.stations[i].uuid !== null) {
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
      if (!cordova.plugins.BluetoothStatus.BTenabled) {
        alert('Bitte schalten Sie Bluetooth ein um Beacons zu empfangen.')
      }
    }
};

guide.initialize();
