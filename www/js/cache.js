var Cache = {
  cacheList: [],
  totalImages: 0,

  init: function(onCachingComplete, onCachingProgress) {
    this.onCachingComplete = onCachingComplete;
    this.onCachingProgress = onCachingProgress;
  },

  empty: function() {
    return ImgCache.getCurrentSize() === 0;
  },

  updatedAt: function() {
    var data = localStorage.getItem('data');
    if(data) {
      return JSON.parse(data).updated_at;
    } else {
      return '1970-01-01T00:00:00.000Z';
    }
  },

  getApiData: function() {
    console.log('[CACHE] get cache data');
    var data = localStorage.getItem('data');
    if (data) {
     return JSON.parse(data); 
    }
  },

  storeApiData: function(data) {
    console.log('[CACHE] store api data');
    localStorage.setItem("data", JSON.stringify(data));
  },

  storeSites: function() {
    console.log('[CACHE] store sites');
    var data = Cache.getApiData();
    for (var i = 0; i < data.posts.length; i++) {
      var site = data.posts[i];
      var url = data.posts[i].url;
      console.log('[CACHE] Storing site ' + url.split('/')[4].split('?')[0] + '.html');
      Network.getHTML(url, Cache.storeHtmlAndImages, url.split('/')[4].split('?')[0] + '.html');
    }
  },

  storeHtmlAndImages: function(html, filename) {
    Cache.storeHtml(html.innerHTML, filename);
    Cache.storeImages(html.innerHTML);
  },

  storeHtml: function(newContent, fileName) {
    console.log('[CACHE] Storing HTML to ' + fileName);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
      fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        Cache.writeFile(fileEntry, newContent, fileName);
      }, Cache.onErrorCreateFile);
    }, Cache.onErrorLoadFs);
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
          }, Cache.onErrorReadFile);
        }, Cache.onErrorCreateFile);
    }, Cache.onErrorLoadFs);
  },

  writeFile: function(fileEntry, text, fileName) {
    fileEntry.createWriter(function (fileWriter) {
      fileWriter.onwriteend = function() {};
      fileWriter.onerror = function(e) {};
      fileWriter.write(text);
    });
  },

  storeImages: function(html) {
    var urls = HtmlParser.getImages(html);
    console.log(urls);
    for(var i = 0; i < urls.length; i++) {
      ImgCache.isCached(urls[i], Cache.cacheCheckComplete);
    }
  },

  cacheCheckComplete: function(url, success) {
    if(!success) {
      Cache.cacheList.push(url);
      console.log('[CACHE] Storing image ' + url);
      ImgCache.cacheFile(url, function() {
        Cache.drop(Cache.cacheList, url);
      });
    } else {
      Cache.drop(Cache.cacheList, url);
    }
  },

  onErrorCreateFile: function() {
    console.log('Error beim erstellen des Files');
  },

  onErrorReadFile: function() {
    console.log('Error beim laden des File');
  },

  onErrorLoadFs: function() {
    console.log('Error beim laden des File System');
  },

  drop: function(array, element) {
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
};
