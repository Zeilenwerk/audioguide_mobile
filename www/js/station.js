var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {

      ImgCache.init(function () {

        var data = JSON.parse(localStorage.getItem("data"));
        var re = /[\?&]station_id=([0-9]+)/g;
        var str = window.location.search;
        var id = re.exec(str)[1];

        window.station = data.stations.filter(function(station) {
          return station.id == id;
        });

        displayData(data, id);


        function displayData(data, station_id) {
          console.log('displayData function');
          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

              console.log('file system open: ' + fs.name);
              fs.root.getFile(station_id + '.html', { create: true, exclusive: false }, function (fileEntry) {

                console.log("fileEntry is file?" + fileEntry.isFile.toString());
                readFile(fileEntry, data);

              }, onErrorCreateFile);

          }, onErrorLoadFs);
        }


        function readFile(fileEntry, data) {

            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function() {
                  document.querySelector('.main').innerHTML = this.result;

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

                  isActive();                     // Akitves Element in der Navigation
                  getThumbnail();                 // Setze Thumbnail für Video
                  startRangingBeacons(data);      // Ermittle Beacons in der Nähe
                };

                reader.readAsText(file);

            }, onErrorReadFile);
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

      }, function () {
        alert('Lokale Daten konnten nicht geladen werden. Guide bitte mit funktionierender Internetverbindung neu öffnen.');
      });
    },
};

app.initialize();
