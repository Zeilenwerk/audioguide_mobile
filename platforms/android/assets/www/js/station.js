var station = {

    displayData: function(station_id)  {
      console.log('displayData function');
      var data = JSON.parse(localStorage.getItem('data'));
      Cache.readFile(station_id + '.html', data, station.onFileLoaded);
    },

    setPoster: function() {
         var video = this;
         var canvas = document.createElement("canvas");
         canvas.width = video.videoWidth;
         canvas.height = video.videoHeight;
         canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
         video.currentTime = 0;
         video.setAttribute('poster', canvas.toDataURL());
         video.removeEventListener('loadedmetadata', station.setTime);
         video.removeEventListener('loadeddata', station.setPoster);
         video.load();
    },

    setTime: function() {
      this.currentTime = 20;
    },

    getThumbnail: function() {
          var videos = document.querySelectorAll('video');

          for (var i = 0; i < videos.length; i++) {
            videos[i].addEventListener('loadedmetadata', station.setTime, false);
            videos[i].addEventListener('loadeddata', station.setPoster, false);
          }
    },

    onFileLoaded: function(that, data) {
      document.querySelector('.main').innerHTML = "";
      document.querySelector('.main').innerHTML = that.result;

      var links = document.querySelectorAll('a');

      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('touchend', guide.onStationClick);
      }

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

      station.getThumbnail();
    }
};
