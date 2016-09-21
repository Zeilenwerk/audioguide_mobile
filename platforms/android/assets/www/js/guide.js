var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      var url = 'http://192.168.1.62:3000/api/guides/7'; // Url für JSON Daten von RailsServer


      // Initialisiere lokalen cache
      var initCache = function() {
          // see console output for debug info
          ImgCache.options.debug = true;
          ImgCache.options.usePersistentCache = true;
          ImgCache.init();
      };

      initCache();


      // Beim ersten Start werden die Daten geladen oder der Cache wird gelöscht
      if (ImgCache.getCurrentSize() === 0) {
        window.location.replace('update.html');
        firstStart();
      }


      // Überprüfe Netzwerkstatus
      var networkState = navigator.connection.type;
      if (networkState === Connection.NONE) {
        console.log('Device is offline');
        onOffline();
      } else {
        get(url, checkUpdate, transferFailed);
        onOffline();
      }


      // Prüft auf neue Updates und zeigt UpdateBox an
      function checkUpdate(newData) {
        var cacheData = JSON.parse(localStorage.getItem("data"));
        if (newData.updated_at !== cacheData.updated_at) {
          var updateBox = document.querySelector('.update-box');
          updateBox.style.visibility = 'visible';
          updateBox.addEventListener('click', goUpdate);
        }
      }


      // Zeige Daten im HTML an, aus online oder lokalen Cache
      function displayData(data) {
        console.log('displayData');

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


    // Wechsel zu Update Seite und anschliessend Update
    function goUpdate() {
      window.location.replace('update.html');
      get(url, saveDataToLocalStorage, transferFailed);
      var updateBox = document.querySelector('.update-box');
      updateBox.style.visibility = 'hidden';
    }


    // Wenn offline, verwende cache
    function onOffline() {
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
