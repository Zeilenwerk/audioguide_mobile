var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      // Wenn Netzwerk verbunden, prüfe Update
      document.addEventListener('online', checkNetwork, false);


      // Initialisiere lokalen cache
      var initCache = function() {
          // see console output for debug info
          ImgCache.options.debug = true;
          ImgCache.options.usePersistentCache = true;
          ImgCache.init();
      };

      initCache();

      setTimeout(firstStart, 1000);

      function firstStart() {
        // Beim ersten Start werden die Daten geladen
        if (ImgCache.getCurrentSize() === 0) {
          console.log('Erster Start');
          window.location.replace('update.html');
        }
      }

      checkNetwork();

      // Überprüfe Netzwerkstatus
      function checkNetwork() {
        console.log('checkNetwork function');
        var networkState = navigator.connection.type;
        if (networkState === Connection.NONE) {
          console.log('Device is offline');
          onOffline();
        } else {
          get(URL, checkUpdate, function(){});
          onOffline();
        }
      }


      // Prüft auf neue Updates und zeigt UpdateBox an
      function checkUpdate(newData) {
        console.log('checkUpdate function');
        var cacheData = JSON.parse(localStorage.getItem("data"));
        if (newData.updated_at !== cacheData.updated_at) {
          var updateBox = document.querySelector('.update-box');
          var p = document.querySelector('p');
          var icon = document.querySelector('.close-icon');
          updateBox.style.visibility = 'visible';
          p.addEventListener('click', goUpdate);
          icon.addEventListener('click', hideIcon);
        }
      }


      // Zeige Daten im HTML an, aus online oder lokalen Cache
      function displayData(data) {
        console.log('displayData');

        var source = $('.main').html();
        var template = Handlebars.compile(source);
        $('.main').html(template({ guide: data, host: API_HOST }));

        startRangingBeacons(data);
    }


    // Wechsel zu Update Seite und anschliessend Update
    function goUpdate() {
      var updateBox = document.querySelector('.update-box');
      updateBox.style.visibility = 'hidden';
      window.location.replace('update.html');
    }


    // Wenn offline, verwende cache
    function onOffline() {
      var data = JSON.parse(localStorage.getItem('data'));
      displayData(data);

      $('img,audio,video').each(function() {
          console.log('load cached files');
          ImgCache.useCachedFile($(this));
      });
    }


    // Verstecke close icon
    function hideIcon(e) {
      e.stopPropagation();
      var updateBox = document.querySelector('.update-box');
      updateBox.style.visibility = 'hidden';
    }

  },
};

app.initialize();
