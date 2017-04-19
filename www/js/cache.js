var Cache = {
  cache: null,
  siteList: [],

  initializeCache: function(success, failure){
    debug('-- Cache.initializeCache');
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

  init: function(onCachingComplete) {
    debug('-- Cache.init');
    this.onCachingComplete = onCachingComplete;
    //this.onCachingProgress = onCachingProgress;
  },

  updatedAt: function() {
    debug('-- Cache.updatedAt');
    if(data = localStorage.getItem('data')) {
      return JSON.parse(data).updated_at;
    } else {
      console.log('[CACHE]No cache data');
      return '1970-01-01T00:00:00.000Z';
    }
  },

  getApiData: function() {
    debug('-- Cache.getApiData');
    var data = localStorage.getItem('data');
    if (data) {
     return JSON.parse(data);
    } else {
      return null;
    }
  },

  storeApiData: function(data) {
    debug('-- Cache.storeApiData');
    localStorage.setItem("data", JSON.stringify(data));
  },

  storeSites: function() {
    debug('-- Cache.storeSites');
    var data = Cache.getApiData();
    update.addLoadingText('Erfolgreich alle Konfigurationsdaten geladen…');

    // store assets
    for (var i = 0; i < data.assets.length; i++) {
      if(data.assets[i] != null){
        debug('Added asset to cache: ' + data.assets[i]);
        Cache.cache.add(URL + '/assets/' + data.assets[i]);
      }
    }
    update.addLoadingText('Erfolgreich alle statischen Medien angefordert…');

    // download first (client) assets, for css to have asset urls
    Cache.cache.download().then(function(cache){
      debug('Asset cacheing successful!');
      update.addLoadingText('Erfolgreich alle statische Medien geladen…');
      Cache.siteList.push('index.css');
      Network.getCss(data.stylesheet, Cache.storeCss, 'index.css');
      Cache.checkCacheingComplete();
    },function() {
      debug('Asset cacheing failed!');
      update.addWarningText('Einige Daten konnten nicht geladen werden, bitte versuche es erneut [#ERR-ASSET]');
    });

    // store sites and media
    for (var i = 0; i < data.posts.length; i++) {
      var site = data.posts[i];
      var url = data.posts[i].url;
      var filename = Network.splitUrl(url) + '.html';
      Cache.siteList.push(filename);
      debug('[CACHE] Storing site ' + filename);
      Network.getHTML(url, Cache.storeHtmlAndImages, filename);
    }
    update.addLoadingText('Erfolgreich alle Seiten und dynamischen Medien angefordert…');
  },

  storeHtmlAndImages: function(html, filename) {
    debug('-- Cache.storeHtmlAndImages');
    Cache.storeHtml(html.innerHTML, filename);
    Cache.storeImages(html.innerHTML);
  },

  storeCss: function(newContent, fileName) {
    debug('-- Cache.storeCss');
    newContent = newContent.replace(/url\((.*?)\)/g, function(match){
      url = match.replace(/url\((.*?)\)/g, '$1');
      return 'url(' + Cache.cache.get(URL + url) + ')';
    });
    debug(newContent);
    debug(fileName);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
      fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        res = Cache.writeFile(fileEntry, newContent, fileName);
        console.log(res);
      }, Cache.onErrorCreateFile);
    }, Cache.onErrorLoadFs);
    update.addLoadingText('Erfolgreich die Gestaltung angepasst…');
  },

  storeHtml: function(newContent, fileName) {
    debug('-- Cache.storeHtml');
    debug('-- Cache.storeHtml fileName:' + fileName);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
      fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        Cache.writeFile(fileEntry, newContent, fileName);
      }, Cache.onErrorCreateFile);
    }, Cache.onErrorLoadFs);
  },

  readFile: function(fileName, data, onFileLoaded) {
    debug('-- Cache.readFile');
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
    debug('-- Cache.writeFile');
    fileEntry.createWriter(function (fileWriter) {
      fileWriter.onwriteend = function() {
        var i = Cache.siteList.indexOf(fileName);
        if(i != -1) {
          Cache.siteList.splice(i, 1);
        }
        Cache.checkCacheingComplete();
      };
      fileWriter.onerror = function(e) {};
      fileWriter.write(text);
    });
  },

  storeImages: function(html) {
    debug('-- Cache.storeImages');
    var urls = HtmlParser.getImages(html);
    console.log(urls);
    for(var i = 0; i < urls.length; i++) {
      if(device.platform === "iOS") {
        url = Network.imageUrlSplit(urls[i]);   // iOS quirck
        Cache.cache.add(url);
      } else {
        Cache.cache.add(urls[i]);               // Android and other devices
      }
    }

    Cache.cache.download().then(function(cache){
      debug('Cacheing successful!');
      update.addLoadingText('Erfolgreich alle dynamischen Medien geladen…');
      Cache.checkCacheingComplete();
    },function() {
      debug('Cacheing failed!');
      update.addWarningText('Einige Daten konnten nicht geladen werden, bitte versuche es erneut [#ERR-MEDIA]');
    });
  },

  onErrorCreateFile: function() {
    debug('-- Cache.onErrorCreateFile');
  },

  onErrorReadFile: function() {
    debug('-- Cache.onErrorReadFile');
  },

  onErrorLoadFs: function() {
    debug('-- Cache.onErrorLoadFs');
  },

  checkCacheingComplete: function() {
    if(Cache.siteList.length <= 0 && !Cache.cache.isDirty()) {
      var data = Cache.getApiData();
      localStorage.setItem("updated_at", data.updated_at);
      Cache.onCachingComplete();
    }
  }
};
