/*
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////  TO-DO

1) Badge Control
2) Link counter
3) custom toolbar to For Gmail

*/

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////  GLOBAL VARIABLES
var ClearComposeId = null;
var email_id = null;

var info = chrome.extension.getURL("images/info.png");

var check_mark_one   = chrome.extension.getURL("images/one.png");
var check_mark_two   = chrome.extension.getURL("images/two.png");
var check_mark_three = chrome.extension.getURL("images/three.png");

// To listen for a message from background.js
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {

        if((msg.from === 'background') && (msg.subject === 'ExtensionOn' ))
        {
            ClearComposeId = setInterval(ComposeListener, 3000);
        }
        else if((msg.from === 'background') && (msg.subject === 'ExtensionOff' ))
        {
            clearInterval(ClearComposeId);
        }
    }
);

// Simple Sleep
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function ComposeListener(){
    if (document.querySelector("[role=dialog]")) {
        catchDialog(document.querySelector("[role=dialog]"));
        clearInterval(ClearComposeId);
    }
}

function catchDialog(dialog){
    // Get Javascript Object on SendButton & Message Body.
    var SendButton = dialog.querySelectorAll("div>[role=button][tabindex=\"1\"]")[0];
    var MessageBody = dialog.querySelectorAll("tbody>tr>td>div")[10].childNodes[0];

    // Create Div that will be the parent of the button.
    var ParentSendButton = document.createElement("div");

    // Create Div and IMG inside.
    var PixelDiv = document.createElement("div");
    var PixelImage = document.createElement("img");
    var UUID = generateUUID();
    PixelImage.src="https://gmailtracker.com/pixel.py?code="+UUID;

    // Put the image inside the div
    PixelDiv.appendChild(PixelImage);

    // Get JQuery Object of SendButton.
    var $SendButton = $(SendButton);
    var ParentObject = $SendButton.parent();

    // Set Attributes to my button to be perfectly in front of the original                   
    $(ParentSendButton).width(ParentObject.width()).height(ParentObject.height()).css({"position":"absolute","background":"blue","opacity":"0.3","top":"0","z-index":"1000"});

    // Pass the OnClick Action ( ClickJacking ) and Add a Pixel with random id.
    ParentSendButton.onclick = function(){

        var Title = dialog.querySelectorAll("h2>div")[1];
        MessageBody.appendChild(PixelDiv);

        $.ajax({
            url: "https://gmailtracker.com/gmail.py",
            type: "POST",
            data: ({"_":Title.innerHTML,"__":UUID,"___":email_id}),
            success: function(data)
            {
                // Click the Real Button
                SendButton.click();

                // Listen For new Compose Request.
                ClearComposeId = setInterval(ComposeListener, 3000);
            },
            error: function()
            {
                console.log("Error code: 1");
            }
        });
    };

    // Insert my button before the original button.
    ParentObject.css("position","relative").get(0).insertBefore(ParentSendButton,SendButton);
}

/* if you currently at Gmail sent page */
setInterval(function(){
    if ((/sent/.test(window.location.href)) && (document.location.hostname == "mail.google.com")){
        console.log("in gmail");
        $.ajax({
            url: "https://gmailtracker.com/gmail.py",
            type: "POST",
            data: ({"___":email_id}),
            success: function(data)
            {
                obj = $.parseJSON(data);
                $.each(obj, function(index, value) {

                    var TitleDecode = base64.decode(value[0]);
                    var $ChildOfMyObject = $("#"+value[2]).children();
                    var uuid = value[2];

                    if (parseInt(value[1]) > 1 )
                    {
                        if (value[4] == ""){
                            $ChildOfMyObject.html("<a  class='tracker_tooltip' title='This message was opened by "+value[1]+" recipient, first opened at "+value[3]+"'><img src="+check_mark_three+" /></a>" + TitleDecode);
                        }else{
                            $ChildOfMyObject.html("<a  class='tracker_tooltip' title='"+value[4]+"'><img src="+info+" /></a><a  class='tracker_tooltip' title='This message was opened by "+value[1]+" recipient, first open at "+value[3]+"'><img src="+check_mark_three+" /></a>" + TitleDecode);
                        }
                    }
                    else if(parseInt(value[1]) == 1)
                    {
                        /* This message was opened by the recipient and we on the sent page so no popup needed */
                        chrome.storage.local.get(uuid, function (result) {
                            var obj = {};
                            if ( jQuery.isEmptyObject(result))
                            {
                                obj[uuid] = "0";
                                chrome.storage.local.set(obj);
                            }
                            else if (result[uuid] == "0")
                            {
                                obj[uuid] = "1";
                                chrome.storage.local.remove(uuid);
                                chrome.storage.local.set(obj);
                            }
                        });

                        if (value[4] == ""){
                            $ChildOfMyObject.html("<a  class='tracker_tooltip' title='This message was opened by "+value[1]+" recipient, at "+value[3]+"'><img src="+check_mark_two+" /></a>" + TitleDecode);
                        }else{
                            $ChildOfMyObject.html("<a  class='tracker_tooltip' title='"+value[4]+"'><img src="+info+" /></a><a  class='tracker_tooltip' title='This message has been opened by "+value[1]+" recipient, first open at "+value[3]+"'><img src="+check_mark_two+" /></a>" + TitleDecode);
                        }
                    }
                    else
                    {
                        $ChildOfMyObject.html("<a  class='tracker_tooltip' title='This message has been received but not yet opened'><img src="+check_mark_one+" /></a>" + TitleDecode);
                    }
                });
            },
            error: function()
            {
                console.log("Error code: 2");
            }
        });
    }
}, 4000);

/* if you currently not at Gmail at all*/
setInterval(function(){
    if (document.location.hostname != "mail.google.com"){
        console.log("not in gmail");

        $.ajax({
            url: "https://gmailtracker.com/gmail.py",
            type: "POST",
            data: ({"___":email_id}),
            success: function(data)
            {
                obj = $.parseJSON(data);
                $.each(obj, function(index, value) {

                    var TitleDecode = base64.decode(value[0]);
                    var $ChildOfMyObject = $("#"+value[2]).children();

                    var uuid = value[2];

                    if(parseInt(value[1]) == 1){
                        chrome.storage.local.get(uuid, function (result) {
                            var obj = {};
                            if ( jQuery.isEmptyObject(result))
                            {
                                obj[uuid] = "0";
                                chrome.storage.local.set(obj);
                            }
                            else if (result[uuid] == "0")
                            {
                                obj[uuid] = "1";
                                chrome.storage.local.remove(uuid);
                                chrome.storage.local.set(obj);

                                chrome.runtime.sendMessage({
                                    from:    'content',
                                    subject: 'Notification',
                                    value:   TitleDecode
                                });
                            }
                        });
                    }
                });
            },
            error: function()
            {
                console.log("Error code: 3");
            }
        });
    }
}, 1000 * 60 * 10);  /* check if there is new data for popup every 10 minutes */

/* Assign unique ID for the Gmail user  */
setTimeout(function(){
    chrome.storage.local.get('email_id', function (result) {
        if ( jQuery.isEmptyObject(result)){
            email_id = generateUUID();
            chrome.storage.local.set({"email_id":email_id});

        }else {
            email_id = result.email_id;
        }
    });
}, 1000);

/* Redesign the Gmail set tab */
setInterval(function(){
    if ((/sent/.test(window.location.href)) && (document.location.hostname == "mail.google.com")) {
        var nodes = document.querySelectorAll("tbody");
        var last = nodes[nodes.length - 1];
        var TdObjects = last.querySelectorAll("tr > td:nth-child(6)");

        $.each(TdObjects, function (index, value) {
            WrapTitles($(value.querySelectorAll("div>span:nth-child(1)")));
        });
    }
},6000);

function WrapTitles(object){
    $.ajax({
        url: "https://gmailtracker.com/gmail.py",
        type: "POST",
        data: ({"_":object.text(),"___":email_id}),
        success: function(data)
        {
            obj = $.parseJSON(data);
            if (obj.length != 0 && !object.hasClass("tracking")){
                var id=obj[0];
                object.wrap('<span id="'+id+'" class="tracking"></span>');
            }
        },
        error: function(){
            console.log("Error code: 4");
        }
    });
}