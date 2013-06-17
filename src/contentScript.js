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

function appendImages() {
  var placeHolder = findAttribute('img', 'src'),
  highestZ = getZIndex() + 1,
  docHeight = $(document).height(),
  pinemoverlay = $('<div id="pinemoverlay"/>'),
  topbar = $('<div id="pinemtopbar"><h1>Pinem</h1><button id="submit-images">submit</button></div>'); 

  $('body').append(pinemoverlay);
  $(pinemoverlay).append(topbar);
  pinemoverlay.css({
    height : docHeight + 'px' ,
    'z-index': highestZ
  });

  $(placeHolder).each(function(index) {
    var pinemcontainer = $('<div class="pinemcontainer"/>'),
        pinemimage = $('<img class="pinemimage" src=' + placeHolder[index].toString()  + '>');
    
    pinemoverlay.append(pinemcontainer);
    pinemcontainer.append(pinemimage);
  });  
};

function sendMess() {
  chrome.extension.sendMessage({action : 'redirectImages'}, function(response) {
    success = response.received;
    console.log(success);
  });
};

$(document).on('click','.pinemimage', function(e) {
    e.preventDefault();
    $(this).data('select', true); 
});

$(document).on('click', '#submit-images', function(e) {
  e.preventDefault();
  var cache = [];

  $('.pinemimage').each(function() {
    $(this).data('select') ? cache.push(this.src) : false;
  });

  console.log(cache);
  sendMess();
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) { 
  if (request === "displayImages") {
    appendImages();
  }
}); 


  