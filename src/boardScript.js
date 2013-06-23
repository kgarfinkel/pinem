chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('message from background.js received')
  if(request.action === 'sendImages') {
    images = request.images;  
    setUp();
    setUpOverlay();
    setUpEvents();
  }
});

Cookie = {
  get: function(e) {
    return tmp = document.cookie.match(RegExp(e + "=.+?($|;)", "g")), tmp && tmp[0] ? unescape(tmp[0].substring(e.length + 1, tmp[0].length).replace(";", "")) || null : null
  }
};

function setUp() {
  var csrft = Cookie.get("csrftoken").toString();

  $.ajaxSetup({
    beforeSend: function(jqXHR, settings) {
      jqXHR.setRequestHeader("X-CSRFToken", csrft);
    }
  });
};

function setUpOverlay() {
  var overlay = $('<div id="boardOverlay"/>');
      container = $('<div id="boardContainer"><button id="test"></div>');
      // boards = $('.boardPickerItem');
      
  overlay.css({
    'z-index' : 10000000
  });

  $('body').append(overlay);
  overlay.append(container);


  $(images).each(function(index) {
    var pinContainer = $('.mainContainer').children();
    container.append((pinContainer).clone(true));  
    $('.pinPreviewImg').eq(index).attr('src', this.src);
  });  
};

function postCreate(boardId, imgURL, link) {
  var data = '{"options":{"board_id":"' + boardId + '","description":"","link":"' + link + '","image_url":"' + imgURL + ',"method":"scraped"},"context":{"app_version":"b80ee78"}}';

  $.post('//pinterest.com/resource/PinResource/create/',
    {data: data,
    source_url : '/pin/find/?url=http%3A%2F%2Fwww.beautyisshe.com%2Fpost%2F51670826848%2Fitaly-ca-1970-photo-stanislao-farri',
    module_path : 'App()>ImagesFeedPage(resource=FindPinImagesResource(url=' + link + '))>Grid()>GridItems()>Pinnable(url='+ imgURL + ', type=pinnable, link=' + link + ')#Modal(module=PinCreate())'
    }, 
    function() {
    console.log('completed');
  }, 'jsonp');
};

function setUpEvents() {
  $('#test').click(function(e) {
    e.preventDefault();

    $(images).each(function(index) {
      var boardId = "238831655177979124",
          imgURL = this.src,
          link = this.href;
        postCreate(boardId,imgURL,link); 

    });  
  });
};