// Return the highest z-index of the current page
// May scratch for optimization  
function getZIndex (selector) {
  var selector = selector || '*',
    zHighest = 0, 
    zCurrent;

  $(selector).each(function() {
    if ($(this).css('z-index') != undefined) {
      zCurrent = parseInt($(this).css('z-index'), 10);
      zCurrent > zHighest ? zHighest = zCurrent : zHighest = zHighest;
    }
  });

 return zHighest;
};

function getImgSize(imgURL, callback) {
  var img = new Image(),
    dimensions = {};

  $(img).attr('src', imgURL);

  img.onload = function() {
  dimensions.w = img.width;
  dimensions.h = img.height;

  if (callback) callback(dimensions);
  };
};

//Find all image sources on page and display each image by appending them as an overlay
//onto the current tab
function appendOverlay() {
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

function displayImages() {
  var images = $('img');
 
  $(images).each(function(i) {
    var pinemImageContainer = $('<div class="pinemImageContainer"/>'),
      pinemImageImg = $('<img class="pinemImage" src=' + this.src  + '>'),
      pinemImageData = $('<span class="pinemData"/>');

    $('.pinemData').attr('imgHref', window.location.href);

    $('#pinemOverlay').append(pinemImageContainer);
    pinemImageContainer.append(pinemImageData);
    pinemImageData.append(pinemImageImg);

    getImgSize(this.src, function(dimensions) { 
      var html = $('<span class = "imgSize">' + dimensions.w + 'x' + dimensions.h + '</span>');

      pinemImageContainer.append(html) 
    });
  });   
};

//Chrome messanger function to send a message (containing a string and image data) 
//to the extension's background page
function sendMess(images) {
  chrome.extension.sendMessage({action : 'redirectImages', images : images}, function(response) {
    success = response.received;
    console.log(success);
  });
};

function imageConstructor(src, href) {
    this.src = src;
    this.href = href;
};

//Set up events for selecting image(s)
function selectImages() { 
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
        var href = $(this).parent().attr('imgHref');
        cache.push(new imageConstructor(src, href));
      } 
    });
    console.log(cache);
    sendMess(cache);
  });
};

//Listen to message from background.js
//When message received call setup functions
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) { 
  if (request === "displayImages") {
    console.log('displayImages message received');
    appendOverlay();
    displayImages();
    selectImages();
  }
}); 