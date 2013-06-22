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

function findAttribute(elem, attr) {
  var placeHolder = []; 

  $(elem).each(function() {
    placeHolder.push($(this).attr(attr));
  });

  return placeHolder;
};

var getImgSize = function(imgSrc) {
  var newImg = {};

  newImg.onload = function() {
    var height = newImg.height,
        width = newImg.width;

    console.log(height + 'x' + width);
  }
  newImg.src = imgSrc;
};

//Find all image sources on page and display each image by appending them as an overlay
//onto the current tab
function displayImages() {
  var images = document.images,
      highestZ = getZIndex() + 1,
      docHeight = $(document).height(),
      pinemOverlay = $('<div id="pinemOverlay"/>'),
      pinemTopBar = $('<div id="pinemTopBar"><h1>Pinem</h1><button id="submit-images">submit</button></div>');


  $('body').append(pinemOverlay);
  $(pinemOverlay).append(pinemTopBar);

  pinemOverlay.css({
    height : docHeight + 'px' ,
    'z-index': highestZ
  });

  $(images).each(function(i) {
    var imgHref;
    //var size = getImgSize(this)
    var pinemImageContainer = $('<div class="pinemImageContainer"/>'),
        imgSource = findAttribute(this, 'src'),
        pinemImageImg = $('<img class="pinemImage" src=' + imgSource.toString()  + '>');
        pinemImageData = $('<span class="pinemData"/>'),

    this.parentNode.tagName.toLowerCase() === 'a' ? imgHref = this.parentNode.href : imgHref = window.location.href;
    $('.pinemData').attr('imgHref', imgHref);

    pinemOverlay.append(pinemImageContainer);
    pinemImageContainer.append(pinemImageData);
    pinemImageData.append(pinemImageImg);
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

//Set up events for selecting image(s)
function selectImages() { 
  //When image is 'clicked', a data attr (select) is set to true
  $(document).on('click','.pinemImage', function(e) {
      e.preventDefault();
      $(this).data('select', true); 
  });

  //When 'submit' button is clicked, store all images with true select attr
  // into an array and send to boardScript.js via sendMess()
  $(document).on('click', '#submit-images', function(e) {
    e.preventDefault(); 
    var imageData = {},
        cache = [];

    $('.pinemImage').each(function() {
      if ($(this).data('select')) {
        imageData['src'] = this.src;
        imageData['href'] = $(this).parent().attr('imgHref');
        cache.push(imageData);
      } 
    });

    sendMess(cache);
  });
};

//Listen to message from background.js
//When message received call setup functions
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) { 
  if (request === "displayImages") {
    console.log('displayImages message received')
    displayImages();
    selectImages();
  }
}); 


  