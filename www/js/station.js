var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      // Parse the local storage
      var data = JSON.parse(localStorage.getItem("data"));

      // Get station id from url param
      var re = /[\?&]station_id=([0-9]+)/g;
      var str = window.location.search;
      var id = re.exec(str)[1];

      // Suche Station anhand der ID in der JSON Datei
      window.station = data.stations.filter(function(station) {
        return station.id == id;
      });

      var source = $('.main').html();
      var template = Handlebars.compile(source);
      console.log(API_HOST);
      $('.main').html(template({ host: API_HOST, guide: data, station: station[0] }));

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

      setTimeout(initCache, 100);

      displayData(data);

      function displayData(data) {
        // Ermittle Beacons in der Nähe
        startRangingBeacons(data);

        isActive();

        $('img,audio,video').each(function() {
            console.log('load cached files');
            ImgCache.useCachedFile($(this));
        });

        getThumbnail();
      }


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

      function isActive() {
        var re = /[\?&]station_id=([0-9]+)/g;
        var str = window.location.search;
        var id = re.exec(str)[1];

        var links = document.querySelectorAll('.nav-links');
        for (var i = 0; i < links.length; i++) {
          var url = links[i].getAttribute('href');
          var re = /[\?&]station_id=([0-9]+)/g;
          var link_id = re.exec(url)[1];
          if (id === link_id) {
            links[i].parentNode.className += " active"
          }
        }
      }


      function setTime() {
        this.currentTime = 20;
      }


      function getThumbnail() {
            var videos = document.querySelectorAll('video');

            for (var i = 0; i < videos.length; i++) {
              videos[i].addEventListener('loadedmetadata', setTime, false);
              videos[i].addEventListener('loadeddata', setPoster, false);
            }
      }
    },
};

app.initialize();
