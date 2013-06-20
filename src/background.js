//when broswer icon is clicked background.js sends message to contentScript.js,
//to initialize displaying all images on the active tab
chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.getSelected(null, function(tab) {
    console.log('clicked')
    chrome.tabs.sendMessage(tab.id, 'displayImages' );
  });
}); 


chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'redirectImages') {
    console.log(request.images);
    sendResponse({received : 'success'});
    injectScript(request.images);  
  }
});

function injectScript(images) {
  chrome.tabs.create({url : 'http://pinterest.com/pin/create/bookmarklet/'}, function(tab) { 
    chrome.tabs.executeScript(tab.id, {file: 'src/BoardScript.js'}, function() {
      chrome.tabs.sendMessage(tab.id, {action: 'sendImages', images: images});
    });
  });
};
