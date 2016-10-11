var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {

      ImgCache.init(function () {

        if (ImgCache.getCurrentSize() === 0) {
          window.location.replace('update.html');
        }

        Network.checkNetwork(function() { get(URL, checkUpdate, function(){}); }, displayData);

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

          displayData();
        }


        // Zeige Daten im HTML an, aus online oder lokalen Cache
        function displayData() {
          console.log('displayData function');
          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

              console.log('file system open: ' + fs.name);
              fs.root.getFile('index.html', { create: true, exclusive: false }, function (fileEntry) {

                console.log("fileEntry is file?" + fileEntry.isFile.toString());
                var data = JSON.parse(localStorage.getItem('data'));
                readFile(fileEntry, data);

              }, onErrorCreateFile);

          }, onErrorLoadFs);
        }


        function readFile(fileEntry, data) {

            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function() {
                    document.querySelector('.main').innerHTML = this.result;

                    $('img,audio,video').each(function() {
                        console.log('load cached files');
                        ImgCache.useCachedFile($(this));
                    });

                    startRangingBeacons(data);
                };

                reader.readAsText(file);

            }, onErrorReadFile);
        }


        function goUpdate() {
          var updateBox = document.querySelector('.update-box');
          updateBox.style.visibility = 'hidden';
          window.location.replace('update.html');
        }


        function hideIcon(e) {
          e.stopPropagation();
          var updateBox = document.querySelector('.update-box');
          updateBox.style.visibility = 'hidden';
        }


        function onErrorCreateFile() {
          console.log('Error beim erstellen des Files');
        }


        function onErrorLoadFs() {
          console.log('Error beim laden des File System');
        }


        function onErrorReadFile() {
          console.log('Error beim laden des File');
        }

      }, function () {
        alert('Lokale Daten konnten nicht geladen werden. Guide bitte mit funktionierender Internetverbindung neu öffnen.');
    });
  },
};

app.initialize();
