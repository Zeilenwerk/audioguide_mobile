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



var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      document.addEventListener("online", onOnline, false);


      // Init local cache
      var initCache = function() {
          // see console output for debug info
          ImgCache.options.debug = true;
          ImgCache.options.usePersistentCache = true;
          ImgCache.init();
      };

      initCache();

      var networkState = navigator.connection.type;
      if (networkState === Connection.NONE) {
        onOffline();
      } else {
        getData();
      }


      // Functions
      function getData() {
          var url = 'http://192.168.1.62:3000/api/guides/7';
          get(url, getDataSuccess, transferFailed);
      }

      function transferFailed() {
        console.log('Fehler beim Laden der Daten');
      }

      function getDataSuccess(data) {
          // Is internet connection there?
          var networkState = navigator.connection.type;
          // save data to local storage
          myStorage = localStorage;
          localStorage.setItem('data', JSON.stringify(data));

          // cache files
          ImgCache.cacheFile(data.picture.url);

          for (var a = 0; a < data.stations.length; a++) {
            for (var i = 0; i < data.stations[a].all_items.length; i++) {
              if (data.stations[a].all_items[i].kind !== 'text') {
                var url = 'http://192.168.1.62:3000' + data.stations[a].all_items[i].file.url;
                console.log("Caching " + url);
                ImgCache.cacheFile(url);
              }
            };
          }

          displayData(data);
        }

        function displayData(data) {
          var div_error = document.querySelector('.error');
          var div_header_pic = document.querySelector('.header-pic');
          var div_titel = document.querySelector('.titel');
          var ul = document.querySelector('ul');
          var div_content = document.querySelector('.content');

          document.querySelector('.header-pic').innerHTML = '';
          document.querySelector('.titel').innerHTML = '';
          document.querySelector('.stations > ul').innerHTML = '';

          var header_pic_img = document.createElement('img');
          header_pic_img.setAttribute('src', 'http://192.168.1.62:3000' + data.picture.url);
          header_pic_img.setAttribute('data-desc', 'local-desc');
          header_pic_img.setAttribute('data-is-cached', 'local_cached');
          div_header_pic.appendChild(header_pic_img);

          var titel = document.createElement('h1');
          titel.innerHTML = data.name;
          div_titel.appendChild(titel);

          for (var i = 0; i < data.stations.length; i++) {
            var li = document.createElement('li');
            li.className += 'list-box';

            var a = document.createElement('a');
            a.setAttribute('href', 'show.html?station_id=' + data.stations[i].id);

            var p_number = document.createElement('p');
            p_number.innerHTML = data.stations[i].number;
            p_number.className += 'stations-number';

            var p_titel = document.createElement('p');
            p_titel.innerHTML = data.stations[i].titel;
            p_titel.className += 'stations-title';

            var icon = document.createElement('i');
            icon.className += 'fa fa-chevron-right fa-right';
            icon.setAttribute('aria-hidden', 'true');

            a.appendChild(p_number);
            a.appendChild(p_titel);
            a.appendChild(icon);

            li.appendChild(a);

            ul.appendChild(li);
          }
      }

      function onOnline() {
        console.log('Device is online');
        getData();

      }

      function onOffline() {
        console.log('Device is offline');

        var data = JSON.parse(localStorage.getItem('data'));
        displayData(data);

        $('img,audio,video').each(function() {
            console.log('load cached files');
            ImgCache.useCachedFile($(this));
        });
      }


    },

};

app.initialize();
