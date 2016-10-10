var app = {
  initialize: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

  onDeviceReady: function() {
    ImgCache.init(function () {
      Network.checkNetwork(app.getApiResponse, app.transferFailed);
    }, function () {
      alert('Lokale Daten konnten nicht geladen werden. Guide bitte mit funktionierender Internetverbindung neu öffnen.');
    });
  },

  getApiResponse: function() {
    console.log('[UPDATE] getting api data');
    get(URL, app.onApiResponseComplete, app.transferFailed);
  },

  transferFailed: function() {
    console.log('[UPDATE] file transfer failed');
  },

  onApiResponseComplete: function(newData) {
    if (newData.updated_at !== Cache.updatedAt()) {
      console.log('[UPDATE] api != localstorage');
      Cache.init(app.onCachingComplete, app.onCachingProgress);
      Cache.storeApiData(newData);
      Cache.storeGuide();
      Cache.storeStations();
    } else {
      console.log('[UPDATE] api = localstorage');
      window.location.replace('index.html');
    }
  },

  onCachingComplete: function() {
    window.location.replace('index.html');
  },

  onCachingProgress: function(percent) {
    console.log("Progress: " + percent);
    var bar = document.querySelector('.progress-bar');
    bar.style.display = 'block';
    var span = document.querySelector('span');
    span.style.width = percent + '%';
  }
};

app.initialize();

/*
        // Speichere Daten in lokalen Speicher
        function saveDataToLocalStorage(data) {
          console.log('saveDataToLocalStorage function');

          var reverse_button = document.querySelector('.reverse-button');
          var back_button = document.querySelector('.back-button');

          reverse_button.style.display = 'none';
          back_button.style.display = 'none';

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
              ImgCache.cacheFile(data.picture.url);
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
                var url = data.stations[a].all_items[i].file.url;
                  ImgCache.isCached(url, function(path, success) {
                    console.log('isCached aufruf')
                    cacheChecked++;
                    if (success) {
                      todo++;
                      if (cacheChecked === total) {
                        cacheFiles(data, todo);
                      }
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
        }

        function cacheFiles(data, todo) {
          var complete = 0;

          if (todo == 0) {
            console.log('Es müssen keine Files gecached werden')
            progress(1,1);
            // Speichere index.html
            getHTML(PUBLIC_URL, saveFile, 'index');

            // Speichere alle Stationen
            for (var i = 0; i < data.stations.length; i++) {
              var url = STATION_URL + data.stations[i].id;
              getHTML(url, saveFile, data.stations[i].id);
            }
          }

          // Cache die Files und zeige Fortschritt an
          for (var a = 0; a < data.stations.length; a++) {
            for (var i = 0; i < data.stations[a].all_items.length; i++) {

              if (data.stations[a].all_items[i].kind != 'text') {
                var url = data.stations[a].all_items[i].file.url;

                console.log('Cache File');
                progress(todo, complete);

                ImgCache.cacheFile(url, function() {
                  complete++;
                  progress(todo, complete);
                  if(todo === complete) {
                    // Speichere index.html
                    getHTML(PUBLIC_URL, saveFile, 'index');

                    // Speichere alle Stationen
                    for (var i = 0; i < data.stations.length; i++) {
                      var url = STATION_URL + data.stations[i].id;
                      getHTML(url, saveFile, data.stations[i].id);
                    }
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
          var progress_bar = document.querySelector('.progress-bar');
          progress_bar.style.display = 'none';
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
*/
