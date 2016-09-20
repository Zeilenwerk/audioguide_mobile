var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      // QuerySelectors
      var div_error = document.querySelector('.error');
      var div_name = document.querySelector('.station-show-titel.list-box');
      var items = document.querySelector('.items');


      // Get station id from url param
      var re = /[\?&]station_id=([0-9]+)/g;
      var str = window.location.search;
      var id = re.exec(str)[1];


      // Parse the local storage
      myStorage = localStorage;
      var data = JSON.parse(myStorage.getItem("data"));

      var initCache = function() {
          // see console output for debug info
          ImgCache.options.debug = true;
          ImgCache.options.usePersistentCache = true;
          ImgCache.init(function() {
            $('img,audio,video').each(function() {
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


      // Filter the data
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
          img.setAttribute('src', 'http://192.168.1.62:3000' + station[0].all_items[i].file.url);
          div.appendChild(img);

        } else if (station[0].all_items[i].kind === 'audio') {
          var div = document.createElement('div');
          div.className += 'item-audio item';
          var audio = document.createElement('audio');
          audio.setAttribute('src', 'http://192.168.1.62:3000' + station[0].all_items[i].file.url);
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
          video.setAttribute('src', 'http://192.168.1.62:3000' + station[0].all_items[i].file.url);
          video.setAttribute('controls', '');
          div.appendChild(video);

        } else {

        }

        items.appendChild(div);
      };

    },

};

app.initialize();
