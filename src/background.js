chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.getSelected(null, function(tab) {
    console.log('clicked')
    chrome.tabs.sendMessage(tab.id, 'displayImages');
  });
}); 

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'redirectImages') {
    sendResponse({received : 'success'});
    injectScript();  
  }
});

function injectScript() {
  chrome.tabs.create({url : 'http://pinterest.com/pin/create/bookmarklet/'}, function(tab) { 
    chrome.tabs.executeScript(tab.id, {file: 'src/BoardScript.js'});
  });
};
