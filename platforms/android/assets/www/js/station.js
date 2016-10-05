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

      // QuerySelectors
      var div_error = document.querySelector('.error');
      var div_name = document.querySelector('.station-show-titel.list-box');
      var items = document.querySelector('.items');

      // Parse the local storage
      var data = JSON.parse(localStorage.getItem("data"));

      // Initialisiere Cache
      var initCache = function() {
          // see console output for debug info
          ImgCache.options.debug = true;
          ImgCache.options.usePersistentCache = true;
          ImgCache.init(function() {
            $('img, audio, video').each(function() {
              console.log('load cached files');
              var element = $(this);
              ImgCache.getCachedFileURL(element.attr('src'), function(source, cdvUrl){
                resolveLocalFileSystemURL(cdvUrl, function(entry) {
                  var nativePath = entry.toURL();
                  element.attr('src', nativePath);
                })
              }, function(){
                console.log('cache fail')
              });
            });
          });
      };

      initCache();

      checkNetwork();

      // Überprüfe Netzwerkstatus
      function checkNetwork() {
        console.log('checkNetwork function');
        var networkState = navigator.connection.type;
        if (networkState === Connection.NONE) {
          console.log('Device is offline');
        } else {
          get(URL, checkUpdate, function(){});
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

      // Wechsel zu Update Seite und anschliessend Update
      function goUpdate() {
        var updateBox = document.querySelector('.update-box');
        updateBox.style.visibility = 'hidden';
        window.location.replace('update.html');
      }


      // Ermittle Beacons in der Nähe
      startRangingBeacons(data);


      // Get station id from url param
      var re = /[\?&]station_id=([0-9]+)/g;
      var str = window.location.search;
      var id = re.exec(str)[1];


      // Suche Station anhand der ID in der JSON Datei
      window.station = data.stations.filter(function(station) {
        return station.id == id;
      });


      // Titel
      var link_back = document.createElement('a');
      link_back.setAttribute('href', 'index.html');

      var icon = document.createElement('i');
      icon.className += 'fa fa-chevron-left fa-left';
      icon.setAttribute('aria-hidden', 'true');

      var p_name = document.createElement('p');
      p_name.innerHTML = station[0].titel;

      link_back.appendChild(icon);
      link_back.appendChild(p_name);
      div_name.appendChild(link_back);


      // Items in station
      for (var i = 0; i < station[0].all_items.length; i++) {

        if (station[0].all_items[i].kind === 'picture') {
          var div = document.createElement('div');
          div.className += 'item-image item';
          var img = document.createElement('img');
          img.setAttribute('src', API_HOST + station[0].all_items[i].file.url);
          div.appendChild(img);

        } else if (station[0].all_items[i].kind === 'audio') {
          var div = document.createElement('div');
          div.className += 'item-audio item';
          var audio = document.createElement('audio');
          audio.setAttribute('src', API_HOST + station[0].all_items[i].file.url);
          audio.setAttribute('controls', '');
          div.appendChild(audio);

        } else if (station[0].all_items[i].kind === 'text') {1
          var div = document.createElement('div');
          div.className += 'item-text item';
          var text = document.createElement('p');
          text.innerHTML = station[0].all_items[i].text;
          div.appendChild(text);

        } else if (station[0].all_items[i].kind === 'video') {
          var div = document.createElement('div');
          div.className += 'item-video item';
          var video = document.createElement('video');
          video.setAttribute('src', API_HOST + station[0].all_items[i].file.url);
          video.setAttribute('controls', '');
          div.appendChild(video);

        } else {

        }

        items.appendChild(div);

        $('img,audio,video').each(function() {
            console.log('load cached files');
            ImgCache.useCachedFile($(this));
        });

        getThumbnail();
      };

      // Thumbnail für vorhandene Video
      function setPoster() {
           var video = this;
           var canvas = document.createElement("canvas");
           canvas.width = video.videoWidth;
           canvas.height = video.videoHeight;
           canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

           video.currentTime = 0;
           video.setAttribute('poster', canvas.toDataURL());

           video.removeEventListener('loadedmetadata', setTime);
           video.removeEventListener('loadeddata', setPoster);

           video.load();
      }


      function setTime() {
        this.currentTime = 15;
      }


      function getThumbnail() {
            var videos = document.querySelectorAll('video');

            for (var i = 0; i < videos.length; i++) {
              videos[i].addEventListener('loadedmetadata', setTime, false);
              videos[i].addEventListener('loadeddata', setPoster, false);
            }
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
