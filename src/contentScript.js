// return the highest z-index of the current page
// may scratch for optimization  
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

//find all pinemImage sources in the current page and store them into an array
//iterate through the stored images and display each pinemImage by appending them as an overlay
//of the current tab
function displayImages() {
  var imgSources = findAttribute('img', 'src'),
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

  $(imgSources).each(function(index) {
    var pinemImageContainer = $('<div class="pinemImageContainer"/>'),
        pinemImage = $('<img class="pinemImage" src=' + imgSources[index].toString()  + '>');
    
    pinemOverlay.append(pinemImageContainer);
    pinemImageContainer.append(pinemImage);
  });  
};

//Chrome messanger function that sends a message to the extension's background page
function sendMess(images) {
  chrome.extension.sendMessage({action : 'redirectImages', images : images}, function(response) {
    success = response.received;
    console.log(success);
  });
};

function selectImageEvents() { 
  $(document).on('click','.pinemImage', function(e) {
      e.preventDefault();
      $(this).data('select', true); 
  });

  $(document).on('click', '#submit-images', function(e) {
    e.preventDefault();
    var cache = [];

    $('.pinemImage').each(function() {
      $(this).data('select') ? cache.push(this.src) : false;
    });

    console.log(cache);
    sendMess(cache);
  });
};

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) { 
  if (request === "displayImages") {
    console.log('displayImages message received')
    displayImages();
    selectImageEvents();
  }
}); 


  