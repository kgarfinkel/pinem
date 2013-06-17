Cookie = {
  get: function(e) {
    return tmp = document.cookie.match(RegExp(e + "=.+?($|;)", "g")), tmp && tmp[0] ? unescape(tmp[0].substring(e.length + 1, tmp[0].length).replace(";", "")) || null : null
  }
};

function getBoards() {
  var overlay = $('<div id="boardoverlay"/>'),
      container = $('<div id="boardcontainer"><button id="test"></div>'),
      unordered = $('<ul id="unordered"/>')
      boards = $('.boardPickerItem'),
      csrft = Cookie.get("csrftoken").toString();


  overlay.css({
    'z-index' : 10000000
  });

  $('body').append(overlay);
  overlay.append(container);
  container.append(unordered)
  unordered.append(boards);


  $.ajaxSetup({
    beforeSend: function(jqXHR, settings) {
      jqXHR.setRequestHeader("X-CSRFToken", csrft);
    }
  });

  $(document).on('click', '.boardPickerItem', function(e) {
    e.preventDefault();

    $(this).data('select', true); 
    console.log('selected: ' + this);
  });

  $('#test').click(function(e) {
    e.preventDefault();

    $('.boardPickerItem').each(function() {
     if ($(this).data('select')) { 
       var boardID = $(this).attr('data-id'),
           data = '{"options":{"board_id":"' + boardID + '","description":"italy 1970","link":"http://www.beautyisshe.com/post/51670826848/italy-ca-1970-photo-stanislao-farri","image_url":"http://25.media.tumblr.com/58b6bdf54e8b52352676bab6b317d4f3/tumblr_mneoh3IGsg1qm6qwdo2_r1_1280.png","method":"scraped"},"context":{"app_version":"b80ee78"}}';
      
      console.log('boardID for request: ' + boardID);

      $.post('//pinterest.com/resource/PinResource/create/',
        {data: data,
        source_url : '/pin/find/?url=http%3A%2F%2Fwww.beautyisshe.com%2Fpost%2F51670826848%2Fitaly-ca-1970-photo-stanislao-farri',
        module_path : 'App()>ImagesFeedPage(resource=FindPinImagesResource(url=http://www.beautyisshe.com/post/51670826848/italy-ca-1970-photo-stanislao-farri))>Grid()>GridItems()>Pinnable(url=http://25.media.tumblr.com/58b6bdf54e8b52352676bab6b317d4f3/tumblr_mneoh3IGsg1qm6qwdo2_r1_1280.png, type=pinnable, link=http://www.beautyisshe.com/post/51670826848/italy-ca-1970-photo-stanislao-farri)#Modal(module=PinCreate())'}, 
        function() {
        console.log('completed');
      }, 'jsonp');
     } 
    });
  });

};


var boards = getBoards();
