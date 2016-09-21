function get(url, callbackSuccess, callbackError) {
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.onload = function(e) {
    if(req.readyState === 4) {
      if(req.status === 200 || req.status === 204) {
        callbackSuccess(JSON.parse(req.responseText));
      } else {
        callbackError(req.responseText);
      }
    }
  };
  req.onerror = function() {
    callbackError(req.responseText)
  };
  req.send(null);
}


// Fehlermeldung
function transferFailed() {
  console.log('Fehler beim Laden der Daten');
  var p = document.querySelector('p');
  p.innerHTML = 'Der Download neuer Inhalte ist leider fehlgeschlagen.<br> Ist der Gerät mit dem Internet verbunden?';
}


var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      var url = 'http://192.168.1.62:3000/api/guides/7'; // Url für JSON Daten von RailsServer


      // Initialisiere lokalen cache
      var initCache = function() {
          // see console output for debug info
          ImgCache.options.debug = true;
          ImgCache.options.usePersistentCache = true;
          ImgCache.init();
      };

      initCache();


      // Hole Daten beim ersten Start
      function firstStart() {
        firstStartText();
        get(url, saveDataToLocalStorage, transferFailed);
      }


      // Speichere Daten in lokalen Speicher
      function saveDataToLocalStorage(data) {
        myStorage.setItem(JSON.stringify(data));
        // Speichere alle Files in den Cache
        ImgCache.cacheFile(newData.picture.url);
        for (var a = 0; a < newData.stations.length; a++) {
          for (var i = 0; i < newData.stations[a].all_items.length; i++) {
            if (newData.stations[a].all_items[i].kind !== 'text') {
              var url = 'http://192.168.1.62:3000' + newData.stations[a].all_items[i].file.url;
              console.log("Caching " + url);
              ImgCache.cacheFile(url);
            }
          };
        }
        goIndex();
      }


      // Abgleich der lokalen Daten mit den neuen Daten
      function isUpdate(newData) {
        var cacheData = JSON.parse(localStorage.getItem("data"));
        if (newData.updated_at !== cacheData.updated_at) {
          myStorage.setItem('data', JSON.stringify(newData));
          // Speichere alle Files in den Cache
          ImgCache.cacheFile(newData.picture.url);
          for (var a = 0; a < newData.stations.length; a++) {
            for (var i = 0; i < newData.stations[a].all_items.length; i++) {
              if (newData.stations[a].all_items[i].kind !== 'text') {
                var url = 'http://192.168.1.62:3000' + newData.stations[a].all_items[i].file.url;
                console.log("Caching " + url);
                ImgCache.cacheFile(url);
              }
            };
          }
        }
      }


      // Gehe zu index.html
      function goIndex() {
        window.location.replace('index.html');
      }


      // Erstmaliger Download
      function firstStartText() {
        console.log('Daten werden geladen');
        var p = document.querySelector('p');
        p.innerHTML = 'Inhalt wird geladen...'
      }


      // Updatemeldung
      function updateText() {
        console.log('Neue Daten geladen');
        var p = document.querySelector('p');
        p.innerHTML = 'Neue Inhalte werden geladen.<br>Bitte etwas Geduld';
      }


    },

};

app.initialize();
