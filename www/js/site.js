var site = {

    displayData: function(url)  {
      console.log('displayData function');
      var data = JSON.parse(localStorage.getItem('data'));
      Cache.readFile(url.split('/')[2].split('?')[0] + '.html', data, site.onFileLoaded);
    },

    setPoster: function() {
         var video = this;
         var canvas = document.createElement("canvas");
         canvas.width = video.videoWidth;
         canvas.height = video.videoHeight;
         canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
         video.currentTime = 0;
         video.setAttribute('poster', canvas.toDataURL());
         video.removeEventListener('loadedmetadata', site.setTime);
         video.removeEventListener('loadeddata', site.setPoster);
         video.load();
    },

    setTime: function() {
      this.currentTime = 5;
    },

    getThumbnail: function() {
          var videos = document.querySelectorAll('video');

          for (var i = 0; i < videos.length; i++) {
            videos[i].addEventListener('loadedmetadata', site.setTime, false);
            videos[i].addEventListener('loadeddata', site.setPoster, false);
          }
    },

    onFileLoaded: function(that, data) {
      document.querySelector('.main').innerHTML = "";
      document.querySelector('.main').innerHTML = that.result;

      var links = document.querySelectorAll('a');

      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', guide.onStationClick);
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

      guide.hideScrollbar();
      guide.setHamburger();

      site.getThumbnail();
    }
};
