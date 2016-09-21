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
          // see console output for debug info
          ImgCache.options.debug = true;
          ImgCache.options.usePersistentCache = true;
          ImgCache.init();
      };

      initCache();


      // Überprüfe ob erster Start und sonst starte Update
      if (ImgCache.getCurrentSize() === 0) {
        firstStart();
      } else {
        updateText();
        get(url, saveDataToLocalStorage, transferFailed);
      }


      // Hole Daten beim ersten Start
      function firstStart() {
        firstStartText();
        get(url, saveDataToLocalStorage, transferFailed);
      }


      // Speichere Daten in lokalen Speicher
      function saveDataToLocalStorage(data) {
        localStorage.setItem("data", JSON.stringify(data));
        // Speichere alle Files in den Cache
        ImgCache.cacheFile(data.picture.url);
        for (var a = 0; a < data.stations.length; a++) {
          for (var i = 0; i < data.stations[a].all_items.length; i++) {
            if (data.stations[a].all_items[i].kind !== 'text') {
              var url = 'http://192.168.1.62:3000' + data.stations[a].all_items[i].file.url;
              console.log("Caching " + url);
              ImgCache.cacheFile(url);
            }
          };
        }
        setTimeout(goIndex, 6000);
      }


      // Gehe zu index.html
      function goIndex() {
        var p = document.querySelector('p');
        p.innerHTML = '';
        window.location.replace('index.html');
      }


      // Erstmaliger Download
      function firstStartText() {
        console.log('Daten werden geladen');
        var p = document.querySelector('p');
        p.innerHTML = "Inhalt wird geladen...";
      }


      // Updatemeldung
      function updateText() {
        console.log('Neue Daten geladen');
        var p = document.querySelector('p');
        p.innerHTML = "Neue Inhalte werden geladen.<br>Bitte etwas Geduld";
      }


      // Fehlermeldung
      function transferFailed() {
        console.log('Fehler beim Laden der Daten');
        var p = document.querySelector('p');
        var button = document.querySelector('.button');
        var loading_gif = document.querySelector('.loading-gif');
        p.innerHTML = 'Der Download neuer Inhalte ist leider fehlgeschlagen, tja.<br> Ist der Gerät mit dem Internet verbunden?';
        loading_gif.style.visibility = 'hidden';
        button.style.visibility = 'visible';
      }
    },
};

app.initialize();
