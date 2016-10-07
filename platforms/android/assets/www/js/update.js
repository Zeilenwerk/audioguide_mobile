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
          get(URL, saveDataToLocalStorage, transferFailed);
        }
      }


      // Hole Daten beim ersten Start
      function firstStart() {
        console.log('firstStart function');
        firstStartText();
        get(URL, saveDataToLocalStorage, transferFailed);
      }


      // Speichere Daten in lokalen Speicher
      function saveDataToLocalStorage(data) {
        var reverse_button = document.querySelector('.reverse-button');
        var back_button = document.querySelector('.back-button');

        reverse_button.style.display = 'none';
        back_button.style.display = 'none';

        console.log('saveDataToLocalStorage function');
        localStorage.setItem("data", JSON.stringify(data));

        // Speichere alle Files in den Cache falls noch nicht vorhanden
        // Guide Picture
        ImgCache.isCached(data.picture.url, function(path, success) {
          console.log('Check Guide Picture');

          if (success) {
            // Wenn schon cached, nichts tun
          } else {
            // Noch nicht cached
            console.log('Cache guide picture');
            ImgCache.cacheFile(API_HOST + data.picture.url);
          }
        });

        var total = 0;
        var cacheChecked = 0;
        var todo = 0;

        for (var a = 0; a < data.stations.length; a++) {
          for (var i = 0; i < data.stations[a].all_items.length; i++) {
            if (data.stations[a].all_items[i].kind != 'text') {
              total++;
            }
          }
        }

        // Anzahl Files die gecached werden müssten
        for (var a = 0; a < data.stations.length; a++) {
          for (var i = 0; i < data.stations[a].all_items.length; i++) {
            if (data.stations[a].all_items[i].kind != 'text') {
              var url = API_HOST + data.stations[a].all_items[i].file.url;
                ImgCache.isCached(url, function(path, success) {
                  console.log('isCached aufruf')
                  cacheChecked++;
                  if (success) {
                    // Wenn schon cached, nichts tun
                  } else {
                    todo++;
                    if (cacheChecked === total) {
                      cacheFiles(data, todo);
                    }
                  }
              });
            }
          }
        }

        if (todo === 0) {
          console.log('Es müssen keine Files gecached werden')
          progress(1,1);
          setTimeout(goIndex, 1500);
        }

      }

      function cacheFiles(data, todo) {
        // todo: 1
        var complete = 0;

        if (todo === 0) {
          console.log('Es müssen keine Files gecached werden')
          goIndex();
        }

        // Cache die Files und zeige Fortschritt an
        for (var a = 0; a < data.stations.length; a++) {
          for (var i = 0; i < data.stations[a].all_items.length; i++) {

            if (data.stations[a].all_items[i].kind != 'text') {
              var url = API_HOST + data.stations[a].all_items[i].file.url;

                    console.log('Cache File');
                    progress(todo, complete);

                    ImgCache.cacheFile(url, function() {
                      complete++;
                      progress(todo, complete);
                      if(todo === complete) {
                        setTimeout(goIndex, 1500);
                      }
                    });
                  }
            }
          }
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
        p.innerHTML = "Neue Inhalte werden geladen.<br>Bitte etwas Geduld";
      }


      // Fortschritt
      function progress(total, complete) {
        console.log('progress function');
        var p = document.querySelector('.progress-text');
        p.style.display = 'block';
        p.innerHTML = complete + ' von ' + total + ' Dateien geladen';
        var bar = document.querySelector('.progress-bar');
        bar.style.display = 'block';
        var span = document.querySelector('span');
        span.style.width = complete / total * 100 + '%';
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
        if (ImgCache.getCurrentSize() === 0) {
          back_button.style.display = 'none';
        } else {
          back_button.style.display = 'block';
          back_button.addEventListener('click', goIndex);
        }
      }
    },
};

app.initialize();
