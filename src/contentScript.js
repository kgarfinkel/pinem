// Return the highest z-index of the current page
// May scratch for optimization  
var getZIndex = function(selector) {
  var selector = selector || '*',
  zHighest = 0, 
  zCurrent;

  $(selector).each(function() {
    if ($(this).css('z-index') !== undefined) {
      zCurrent = parseInt($(this).css('z-index'), 10);
      zHighest = zCurrent > zHighest ? zCurrent : zHighest;
    }
  });

  return zHighest;
};

//get and store size of original image
var getImgSize = function(imgURL, callback) {
  var img = new Image(),
    dimensions = {};

  $(img).attr('src', imgURL);

  img.onload = function() {
    dimensions.w = img.width;
    dimensions.h = img.height;

    if (callback) callback(dimensions);
  };
};

//setup an overlay on current tab
var appendOverlay = function() {
  var highestZ = getZIndex() + 1,
    docHeight = $(document).height(),
    pinemOverlay = $('<div id="pinemOverlay"/>'),
    pinemTopBar = $('<div id="pinemTopBar"><h1>Pinem</h1><button id="submit-images">submit</button></div>');

  $('body').append(pinemOverlay);
  $(pinemOverlay).append(pinemTopBar);

  pinemOverlay.css({
    height : docHeight + 'px' ,
    'z-index': highestZ
  });
};

//Find all images on page and display on the current tab
var displayImages = function() {
  var images = $('img');
 
  $(images).each(function(image) {
    var pinemImageContainer = $('<div class="pinemImageContainer"/>'),
      pinemImageImg = $('<img class="pinemImage" src=' + this.src  + '>'),
      pinemImageData = $('<span class="pinemData"/>');

    $('.pinemData').attr('imgHref', window.location.href);

    $('#pinemOverlay').append(pinemImageContainer);
    pinemImageContainer.append(pinemImageData);
    pinemImageData.append(pinemImageImg);

    getImgSize(this.src, function(dimensions) { 
      var html = $('<span class = "imgSize">' + dimensions.w + 'x' + dimensions.h + '</span>');

      pinemImageData.append(html); 
    });
  });   
};

//Chrome messanger function to send a message (containing image data) to the background page
var sendMess = function(images) {
  chrome.extension.sendMessage({action : 'redirectImages', images : images}, function(response) {
    success = response.received;
    console.log(success);
  });
};

var imageConstructor = function(src, href) {
  this.src = src;
  this.href = href;
};

//Set up events for selecting image(s)
var selectImages = function() { 
  $(document).on('click','.pinemImage', function(e) {
      e.preventDefault();
      $(this).data('select', true); 
  });

  $(document).on('click', '#submit-images', function(e) {
    e.preventDefault(); 
    var cache = [];

    $('.pinemImage').each(function(image) {
      if ($(this).data('select')) {
        var src = this.src;
        
        href = $(this).parent().attr('imgHref');
        cache.push(new imageConstructor(src, href));
      } 
    });
    
    console.log(cache);
    sendMess(cache);
  });
};

//When message received from background.jssetup functions
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) { 
  if (request === "displayImages") {
    console.log('displayImages message received');
    appendOverlay();
    displayImages();
    selectImages();
  }
}); 