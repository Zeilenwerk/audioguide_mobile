var url = 'http://192.168.1.62:3000/api/guides/7'; // Url für JSON Daten von RailsServer
var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      // Initialisiere lokalen cache
      var initCache = function() {
          ImgCache.options.debug = true;
          ImgCache.options.usePersistentCache = true;
          ImgCache.init();
      };

      initCache();

      checkNetwork();


      // Überprüfe Netzwerkstatus
      function checkNetwork() {
        console.log('checkNetwork function');
        var networkState = navigator.connection.type;
        if (networkState === Connection.NONE) {
          transferFailed();
        } else {
          checking();
        }
      }


      // Überprüfe ob erster Start und sonst starte Update
      function checking() {
        console.log('checking function');
        if (ImgCache.getCurrentSize() === 0) {
          firstStart();
        } else {
          var reverse_button = document.querySelector('.reverse-button');
          var back_button = document.querySelector('.back-button');
          reverse_button.style.display = 'none';
          back_button.style.display = 'none';
          updateText();
          get(url, saveDataToLocalStorage, transferFailed);
        }
      }


      // Hole Daten beim ersten Start
      function firstStart() {
        console.log('firstStart function');
        firstStartText();
        get(url, saveDataToLocalStorage, transferFailed);
      }


      // Speichere Daten in lokalen Speicher
      function saveDataToLocalStorage(data) {
        console.log('saveDataToLocalStorage function');
        localStorage.setItem("data", JSON.stringify(data));

        // Speichere alle Files in den Cache falls noch nicht vorhanden
        // Guide Picture
        ImgCache.isCached(data.picture.url, function(path, success) {
          if (success) {
            // Wenn schon cached, nichts tun
          } else {
            // Noch nicht cached
            ImgCache.cacheFile(data.picture.url);
          }
        });

        // Stations files
        for (var a = 0; a < data.stations.length; a++) {
          for (var i = 0; i < data.stations[a].all_items.length; i++) {
            if (data.stations[a].all_items[i].kind !== 'text') {
              var url = 'http://192.168.1.62:3000' + data.stations[a].all_items[i].file.url;
                ImgCache.isCached(url, function(path, success) {
                  if (success) {
                    // Wenn schon cached, nichts tun
                  } else {
                    // Noch nicht cached.
                    console.log("Caching " + url);
                    ImgCache.cacheFile(url);
                  }
              });
            }
          };
        }
        setTimeout(goIndex, 5000);
      }


      // Gehe zu index.html
      function goIndex() {
        console.log('goIndex function');
        var p = document.querySelector('p');
        p.innerHTML = '';
        window.location.replace('index.html');
      }


      // Erstmaliger Download
      function firstStartText() {
        console.log('firstStartText function');
        var p = document.querySelector('p');
        p.innerHTML = "Inhalt wird geladen...";
      }


      // Updatemeldung
      function updateText() {
        console.log('updateText function');
        var p = document.querySelector('p');
        var loading_gif = document.querySelector('.loading-gif');
        p.innerHTML = "Neue Inhalte werden geladen.<br>Bitte etwas Geduld";
        loading_gif.style.display = 'block';
      }


      // Fehlermeldung
      function transferFailed() {
        console.log('transferFailed function');
        var p = document.querySelector('p');
        var reverse_button = document.querySelector('.reverse-button');
        var back_button = document.querySelector('.back-button');
        p.innerHTML = 'Der Download neuer Inhalte ist leider fehlgeschlagen, tja.<br> Ist der Gerät mit dem Internet verbunden?';
        reverse_button.style.display = 'block';
        reverse_button.addEventListener('click', checkNetwork);
        if (ImgCache.getCurrentSize === 0) {
          back_button.style.display = 'none';
        } else {
          back_button.style.display = 'block';
          back_button.addEventListener('click', goIndex);
        }
      }
    },
};

app.initialize();
