chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('message from background.js received');
  if(request.action === 'sendImages') {
    var images = request.images;
    console.log(images);
    setUp();
    setUpOverlay(images);
    selectBoard(images);
    setUpEvents(images);
  }
});

Cookie = {
  get: function(e) {
    return tmp = document.cookie.match(RegExp(e + "=.+?($|;)", "g")), tmp && tmp[0] ? unescape(tmp[0].substring(e.length + 1, tmp[0].length).replace(";", "")) || null : null
  }
};

var setUp = function() {
  var csrft = Cookie.get("csrftoken").toString();

  $.ajaxSetup({
    beforeSend: function(jqXHR, settings) {
      jqXHR.setRequestHeader("X-CSRFToken", csrft);
    }
  });
};


var setUpOverlay = function(images) {
  var overlay = $('<div id="boardOverlay"/>'),
    container = $('<div id="boardContainer"><button id="test"></div>'),
    pinBookmarklet = $('.PinBookmarklet').eq(0);

  $('.formFooter').remove();

  overlay.css({
    'z-index' : 10000000
  });

  $('body').append(overlay);
  overlay.append(container);

  //for each image selected, append a cloned board container
  $(images).each(function(image) {
    var clone = pinBookmarklet.clone(true);

    //search for nearest image src and set the source to current image's source
    container.append(clone); 
    $('.pinPreviewImg', clone).attr('src', this.src);
    $('#pinFormDescription', clone).addClass('pinFormDescription');
  });  
};

var postCreate = function(boardId, imgURL, link, description) {
  description = description || '';
  var data = '{"options":{"board_id":"' + boardId + '","description":"' + description + '","link":"' + link + '","image_url":"' + imgURL + '","method":"scraped"},"context":{"app_version":"5ad1cd"}}';

  $.post('//pinterest.com/resource/PinResource/create/',
    {data: data,
    source_url : '/pin/find/?url=' + encodeURIComponent(link),
    module_path : 'App()>ImagesFeedPage(resource=FindPinImagesResource(url=' + link + '))>Grid()>GridItems()>Pinnable(url='+ imgURL + ', type=pinnable, link=' + link + ')#Modal(module=PinCreate())'
    }, 
    function(response) {
    console.log(response);
  });
};

//function to a different board per image
var selectBoard = function(images) {
  //when a board menu is clicked on, any previously opened menus
  // will be hidden, and the current menu will be shown
  $('.BoardPicker').on('click', function(e) {
    e.stopPropagation();
    $('.boardPickerInnerWrapper').removeClass('visible');
    $('.boardPickerInnerWrapper', $(this)).addClass('visible');
  });

  $('.boardPickerInnerWrapper.visible').on('click', function(e) {
    e.stopPropagation();
  });

  //hide menu when any part of the document is clicked
  $(document).on('click', function() {
    $('.boardPickerInnerWrapper.visible').removeClass('visible');
  });

  //when a board menu item is clicked on
  //get data-id and closest image tag
  $('.boardPickerItem').each(function() {
    $(this).on('click', function() {
      $(this).addClass('active');

      var boardID = $(this).attr('data-id'), 
        standardForm = $(this).parents('.standardForm:first'),
        img = $('.pinPreviewImg', standardForm);

      //set images object properties to include the appropriate board data-id 
      //by comparing the image tags src to the image objects source 
      $('.currentBoardName', standardForm).text($(this).text());
      $(images).each(function(key, image) {
        if (image.src === img.attr('src')) {
          image.boardID = boardID;
        }
      });
    });
  });
};

//allow for user to submit a description for each pin
var description = function(images) {
  $('#pinFormDescription').addClass('pinFormDescription');
  $('.standardForm').each(function(key, el) {
    var that = this;
    $(images).each(function(key, image) {
      var img = $('.pinPreviewImg', that);
      if (img.attr('src') === image.src) {
        image.descript = $('.pinFormDescription', that).val();
      }
    });
  });

};
 
var setUpEvents = function (images) {
  $('#test').on('click',function(e) {
    e.preventDefault();
    description(images);

    $(images).each(function(key, image) {
      var imgURL = this.src,
      link = this.href;
      boardId = this.boardID || $('.boardPickerItem').attr('data-id'),
      descript = this.descript;
      postCreate(boardId, imgURL, link, descript); 
    });  
  });
};