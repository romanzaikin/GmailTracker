// global variables
var start = "ExtensionOff";

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {

    if ( start == "ExtensionOff" ){
        chrome.browserAction.setIcon({path:"images/gmail_logged_in.png"});
        start = "ExtensionOn";

    }else{
        chrome.browserAction.setIcon({path:"images/gmail_not_logged_in.png"});
        start = "ExtensionOff";
    }

    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            from:    "background",
            subject: start
        });
    });

});


// Called when the content pass the message.
chrome.runtime.onMessage.addListener(function (msg, sender) {
    if (msg.from == "content")
    {
        if (msg.subject == "Notification")
        {
            chrome.notifications.create("GmailTrackerPopUp",
            {
                type:"basic",
                title:"GmailTracker: Your message was opened",
                message: "New information about :"+ msg.value,
                iconUrl:"images/logo.png",
                buttons:[
                    {
                        title:"Open Gmail"
                    }
                ]
            });
        }
    }
});

/* Respond to the user's click on the buttons */
chrome.notifications.onButtonClicked.addListener(function() {
    chrome.tabs.create({
        url: "https://mail.google.com/mail/u/0/#sent"
    });
});

/* Instruction 2 */
if ((window.localStorage.getItem('FirstTime')) && (!window.localStorage.getItem('SecondTime'))){
    window.localStorage.setItem('SecondTime', 'Yes');
    chrome.tabs.create({
        url: "https://gmailtracker.com/instruction.html"
    });
}
/* Instruction 1 */
if (!window.localStorage.getItem('FirstTime')) {
    window.localStorage.setItem('FirstTime', 'Yes');
    chrome.tabs.create({
        url: "https://gmailtracker.com/instruction.html"
    });
}

