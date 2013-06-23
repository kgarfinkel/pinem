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

function getImgSize(imgURL, callback) {
  var img = new Image(),
      dimensions = {};

  $(img).attr('src', imgURL).load(function() {
    dimensions['w'] = this.width;
    dimensions['h'] = this.height;

    if(callback) callback(dimensions);
  });
};

function displayImgSize(imgURL, callback) {
  getImgSize(imgURL, function(t) {
    var html = '<span class="imgSize">' + t.h + 'x' + t.w + '<span/>';
    callback(html);
  });
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
  var images = document.images;

  $(images).each(function(i) {
    var imgHref;
    var pinemImageContainer = $('<div class="pinemImageContainer"/>'),
        imgSource = findAttribute(this, 'src'),
        pinemImageImg = $('<img class="pinemImage" src=' + imgSource.toString()  + '>');
        pinemImageData = $('<span class="pinemData"/>');
    // disImgSize = displayImgSize(this.src, function(sizeHTML) {
    //   return sizeHTML;
    // });

    $(this).parent().prop('tagName') === 'A' ? imgHref = $(this).parent().href : imgHref = window.location.href;
    $('.pinemData').attr('imgHref', imgHref);

    $('#pinemOverlay').append(pinemImageContainer);
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
