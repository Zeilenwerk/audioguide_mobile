var Cache = {
  cache: null,

  initializeCache: function(success, failure){
    debug('Cache.initializeCache');
    Cache.cache = new CordovaFileCache({
      fs: new CordovaPromiseFS({
          Promise: Promise
      }),
      mode: 'hash',
      localRoot: 'data',
      serverRoot: URL,
      cacheBuster: false
    });
    Cache.cache.ready.then(success, failure);
  },

  init: function(onCachingComplete, onCachingProgress) {
    this.onCachingComplete = onCachingComplete;
    this.onCachingProgress = onCachingProgress;
  },

  updatedAt: function() {
    if(data = localStorage.getItem('data')) {
      return JSON.parse(data).updated_at;
    } else {
      console.log('[CACHE]No cache data');
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
    debug('[CACHE] store api data');
    localStorage.setItem("data", JSON.stringify(data));
  },

  storeSites: function() {
    debug('[CACHE] store html sites');
    var data = Cache.getApiData();

    // store assets
    for (var i = 0; i < data.assets.length; i++) {
      if(data.assets[i] != null){
        debug('Added asset to cache: ' + data.assets[i]);
        Cache.cache.add(URL + '/assets/' + data.assets[i]);
      }
    }

    // download first (client) assets, for css to have asset urls
    Cache.cache.download(function(){ /* progress */ }, false).then(function(cache){
      debug('Asset cacheing successful!');
      Network.getCss(data.stylesheet, Cache.storeCss, 'index.css');
    },function() {
      debug('Asset cacheing failed!');
    });

    // store sites and media
    for (var i = 0; i < data.posts.length; i++) {
      var site = data.posts[i];
      var url = data.posts[i].url;
      debug('[CACHE] Storing site ' + Network.splitUrl(url) + '.html');
      Network.getHTML(url, Cache.storeHtmlAndImages, Network.splitUrl(url) + '.html');
    }
  },

  storeHtmlAndImages: function(html, filename) {
    Cache.storeHtml(html.innerHTML, filename);
    Cache.storeImages(html.innerHTML);
  },

  storeCss: function(newContent, fileName) {
    newContent = newContent.replace(/url\((.*?)\)/g, function(match){
      url = match.replace(/url\((.*?)\)/g, '$1');
      return 'url(' + Cache.cache.get(URL + url) + ')';
    });
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
      fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        Cache.writeFile(fileEntry, newContent, fileName);
      }, Cache.onErrorCreateFile);
    }, Cache.onErrorLoadFs);
  },

  storeHtml: function(newContent, fileName) {
    console.log('[CACHE] Cache HTML to ' + fileName);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
      fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        Cache.writeFile(fileEntry, newContent, fileName);
      }, Cache.onErrorCreateFile);
    }, Cache.onErrorLoadFs);
  },

  readFile: function(fileName, data, onFileLoaded) {
    console.log('[CACHE] Reading html from ' + fileName);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
          fileEntry.file(function (file) {
              var reader = new FileReader();
              reader.onloadend = function() {
                console.log(this);
                onFileLoaded(this, data);
              };
              reader.readAsText(file);
          }, Cache.onErrorReadFile);
        }, Cache.onErrorCreateFile);
    }, Cache.onErrorLoadFs);
  },

  writeFile: function(fileEntry, text, fileName) {
    fileEntry.createWriter(function (fileWriter) {
      fileWriter.onwriteend = function() {
        //Cache.drop(Cache.cacheList, fileName);
      };
      fileWriter.onerror = function(e) {};
      fileWriter.write(text);
    });
  },

  storeImages: function(html) {
    var urls = HtmlParser.getImages(html);

    for(var i = 0; i < urls.length; i++) {
      if(device.platform === "iOS") {
        url = Network.imageUrlSplit(urls[i]);   // iOS quirck
        Cache.cache.add(url);
      } else {
        Cache.cache.add(urls[i]);                    // Android and other devices
      }
    }

    Cache.cache.download(function(){ /* progress */ }, false).then(function(cache){
      debug('Cacheing successful!');
      Cache.onCachingComplete();
    },function() {
      debug('Cacheing failed!');
    });
  },

  onErrorCreateFile: function() {
    console.log('Error beim erstellen des Files');
  },

  onErrorReadFile: function() {
    console.log('Error beim laden des File');
  },

  onErrorLoadFs: function() {
    console.log('Error beim laden des File System');
  }
};
