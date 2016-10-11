var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      StatusBar.hide();
      
      ImgCache.init(function () {

        if (Cache.empty()) {
          window.location.replace('update.html');
        }

        Network.onUpdateAvailable(function() {
          window.location.replace('update.html');
        }, function() {
          app.displayData();
        });
      }, function () {
        alert('Lokale Daten konnten nicht geladen werden. Guide bitte mit funktionierender Internetverbindung neu öffnen.');
      });
    },


    // Zeige Daten im HTML an, aus online oder lokalen Cache
    displayData: function() {
      console.log('displayData function');
      var data = JSON.parse(localStorage.getItem('data'));
      Cache.readFile('index.html', data, app.onFileLoaded);
    },

    onFileLoaded: function(that, data) {
      document.querySelector('.main').innerHTML = that.result;

      $('img,audio,video').each(function() {
          console.log('load cached files');
          ImgCache.useCachedFile($(this));
      });

      startRangingBeacons(data);
    }
};

app.initialize();

function goUpdate() {
  var updateBox = document.querySelector('.update-box');
  updateBox.style.visibility = 'hidden';
  window.location.replace('update.html');
}


function hideIcon(e) {
  e.stopPropagation();
  var updateBox = document.querySelector('.update-box');
  updateBox.style.visibility = 'hidden';
}
