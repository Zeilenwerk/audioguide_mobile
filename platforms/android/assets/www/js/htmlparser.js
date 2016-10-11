var HtmlParser = {
  getImages: function(html) {
    return $(html).find('img, audio, video').map(function() { return $(this).attr('src'); });
  },

  getID: function(string) {
    var re = /[\?&]station_id=([0-9]+)/g;
    var id = re.exec(string)[1];
    return id;
  }
};
