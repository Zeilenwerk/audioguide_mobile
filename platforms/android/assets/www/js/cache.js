var Cache = {
  init: function(onCachingComplete, onCachingProgress) {
    this.onCachingComplete = onCachingComplete;
    this.onCachingProgress = onCachingProgress;
  },

  empty: function() {
    return ImgCache.getCurrentSize() === 0;
  },

  updatedAt: function() {
    var d = localStorage.getItem('data');
    if(d) {
      return JSON.parse(d).updated_at;
    } else {
      return '1970-01-01T00:00:00.000Z';
    }
  },

  cacheList: [],
  totalImages: 1,

  getApiData: function() {
    return JSON.parse(localStorage.getItem('data'));
  },

  storeApiData: function(data) {
    localStorage.setItem("data", JSON.stringify(data));
  },

  storeGuide: function() {
    console.log('[CACHE] Storing guide');
    Network.getHTML(PUBLIC_URL, Cache.storeHtmlAndImages, 'index.html');
  },

  storeStations: function() {
    var data = Cache.getApiData();
    for (var i = 0; i < data.stations.length; i++) {
      var station = data.stations[i];
      var url = STATION_URL + station.id;
      console.log('[CACHE] Storing station ' + station.id);
      Network.getHTML(url, Cache.storeHtmlAndImages, station.id + '.html');
    }
  },

  storeHtmlAndImages: function(html, filename) {
    Cache.storeHtml(html.innerHTML, filename);
    Cache.storeImages(html);
  },

  storeHtml: function(newContent, fileName) {
    console.log('[CACHE] Storing HTML to ' + fileName);
    // TODO Cache.cacheList.push(fileName);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
      fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        Cache.writeFile(fileEntry, newContent, fileName);
      }, onErrorCreateFile);
    }, onErrorLoadFs);
  },

  readFile: function(fileName, data, onFileLoaded) {
    console.log('[CACHE] Reading html from ' + fileName);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        console.log('file system open: ' + fs.name);
        fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
          fileEntry.file(function (file) {
              var reader = new FileReader();
              reader.onloadend = function() {
                onFileLoaded(this, data);
              };
              reader.readAsText(file);
          }, onErrorReadFile);
        }, onErrorCreateFile);
    }, onErrorLoadFs);
  },

  // Write to file in system
  writeFile: function(fileEntry, text, fileName) {
    fileEntry.createWriter(function (fileWriter) {
      fileWriter.onwriteend = function() {
        // TODO drop(Cache.cacheList, fileName);
      };

      fileWriter.onerror = function (e) {
        //console.log("Failed file write: " + e.toString());
      };
      fileWriter.write(text);
    });
  },

  storeImages: function(html) {
    var urls = HtmlParser.getImages(html);
    for(var i = 0; i < urls.length; i++) {
      ImgCache.isCached(urls[i], Cache.cacheCheckComplete);
    }
  },

  cacheCheckComplete: function(url, success) {
    if(!success) {
      Cache.cacheList.push(url);
      console.log('[CACHE] Storing image ' + url);
      ImgCache.cacheFile(url, function() {
        drop(Cache.cacheList, url);
      });
    } else {
      drop(Cache.cacheList, url);
    }
  },
};

function onErrorCreateFile() {
  console.log('Error beim erstellen des Files');
}

function onErrorReadFile() {
  console.log('Error beim laden des File');
}

function onErrorLoadFs() {
  console.log('Error beim laden des File System');
}

function drop(array, element) {
  if(array.length > Cache.totalImages) {
    Cache.totalImages = array.length;
  }
  var index = array.indexOf(element);
  if(index > -1) {
    array.splice(index, 1);
  }
  Cache.onCachingProgress((1 - array.length / Cache.totalImages) * 100);
  if(array.length === 0) {
    Cache.onCachingComplete();
  }
}
