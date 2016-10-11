var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      StatusBar.hide();

      ImgCache.init(function () {

        var data = JSON.parse(localStorage.getItem("data"));
        var re = /[\?&]station_id=([0-9]+)/g;
        var str = window.location.search;
        var id = re.exec(str)[1];

        window.station = data.stations.filter(function(station) {
          return station.id == id;
        });

        app.displayData(id);

      }, function () {
        alert('Lokale Daten konnten nicht geladen werden. Guide bitte mit funktionierender Internetverbindung neu öffnen.');
      });
    },

    displayData: function(station_id)  {
      console.log('displayData function');
      var data = JSON.parse(localStorage.getItem('data'));
      Cache.readFile(station_id + '.html', data, app.onFileLoaded);
    },

    setPoster: function() {
         var video = this;
         var canvas = document.createElement("canvas");
         canvas.width = video.videoWidth;
         canvas.height = video.videoHeight;
         canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
         video.currentTime = 0;
         video.setAttribute('poster', canvas.toDataURL());
         video.removeEventListener('loadedmetadata', app.setTime);
         video.removeEventListener('loadeddata', app.setPoster);
         video.load();
    },


    isActive: function() {
      var re = /[\?&]station_id=([0-9]+)/g;
      var str = window.location.search;
      var id = re.exec(str)[1];

      var links = document.querySelectorAll('.nav-links');
      for (var i = 0; i < links.length; i++) {
        var url = links[i].getAttribute('href');
        var re2 = /[\?&]station_id=([0-9]+)/g;
        var link_id = re2.exec(url)[1];
        if (id === link_id) {
          links[i].parentNode.className += " active";
        }
      }
    },


    setTime: function() {
      this.currentTime = 20;
    },


    getThumbnail: function() {
          var videos = document.querySelectorAll('video');

          for (var i = 0; i < videos.length; i++) {
            videos[i].addEventListener('loadedmetadata', app.setTime, false);
            videos[i].addEventListener('loadeddata', app.setPoster, false);
          }
    },

    onFileLoaded: function(that, data) {
      document.querySelector('.main').innerHTML = that.result;

      $('img, audio, video').each(function() {
        console.log('load cached files');
        var element = $(this);
        ImgCache.getCachedFileURL(element.attr('src'), function(source, cdvUrl){
          resolveLocalFileSystemURL(cdvUrl, function(entry) {
            var nativePath = entry.toURL();
            element.attr('src', nativePath);
          });
        }, function(){
          console.log('cache fail');
        });
      });

      app.isActive();                     // Akitves Element in der Navigation
      app.getThumbnail();                 // Setze Thumbnail für Video
      startRangingBeacons(data);      // Ermittle Beacons in der Nähe
    }
};

app.initialize();
