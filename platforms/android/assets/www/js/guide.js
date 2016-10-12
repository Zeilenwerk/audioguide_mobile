var guide = {
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
          guide.displayData();
        });
      }, function () {
        alert('Lokale Daten konnten nicht geladen werden. Guide bitte mit funktionierender Internetverbindung neu öffnen.');
      });
    },


    // Zeige Daten im HTML an, aus online oder lokalen Cache
    displayData: function() {
      console.log('displayData function');
      var data = JSON.parse(localStorage.getItem('data'));
      Cache.readFile('index.html', data, guide.onFileLoaded);
    },

    onFileLoaded: function(that, data) {
      document.querySelector('.main').innerHTML = that.result;

      var links = document.querySelectorAll('a');

      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', guide.onStationClick);
      }

      $('img,audio,video').each(function() {
          console.log('load cached files');
          ImgCache.useCachedFile($(this));
      });

      startRangingBeacons(data);
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
    }
};

guide.initialize();

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
