var HtmlParser = {
  getImages: function(html) {
    return $(html).find('img, audio, video').map(function() { return $(this).attr('src'); });
  }
};
