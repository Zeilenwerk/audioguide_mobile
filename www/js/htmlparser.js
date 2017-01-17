var HtmlParser = {
  getImages: function(html) {
    var urls = [];
    $(html).find('img, audio, video').map(function() { 
      urls.push( $(this).attr('src') );
    });

    $(html).find('.sw--background_image').map(function() {
      urls.push( $(this).css('background-image').replace('url("','').replace('")','') );
    });
    
    return urls;
  }
};
