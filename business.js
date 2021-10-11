
/**
 * Keep track of the last selected channel
 */
var selectedChannel;

/**
 * Keep track of all messages on screen
 */
var messagesOnScreen = [];

/**
 * Connect to sendbird
 */
function connectToChat() {
    connect(userId, callThisFunctionWhenNewMessageIsReceived, () => {
        document.getElementById('connectToChatDiv').style.display = 'none';
        document.getElementById('chatConnectedDiv').style.display = 'block';
        listMyChannels();
    })
}

/**
 * This function will be called when a new 
 * message arrives.
 */
function callThisFunctionWhenNewMessageIsReceived(channel, message) {
    if (selectedChannel && message.sender) {
        if (channel.url == selectedChannel.url) {
            addThisMessageToTheList(message);
            getAllConfirmedMessages();
        }
    }
}

/**
 * Let's show this signed user's channel
 */
function listMyChannels() {
    listChannels((channels) => {
        drawChannelList(channels);
    })
}
function drawChannelList(channels) {
    let out = `<ul class="list-group">`;
    for (let ch of channels) {
        out += `<li style="cursor:pointer" class="list-group-item" onclick="getMyMessages('${ ch.url }')">${ ch.name }</li>`;
    }
    out += `</ul>`;
    document.getElementById('channelList').innerHTML = out;
}

/**
 * Get messages from selected channel
 */
function getMyMessages(channelUrl) {
    getChannelFromUrl(channelUrl, (channel) => {
        selectedChannel = channel;
        document.getElementById('messageList').innerHTML = '';
        listMessages(channel, (messages) => {
            console.log(messages);
            messagesOnScreen = messages;
            drawMessagesFromChannel(messages);
            getAllConfirmedMessages();
        })
    })
}
function drawMessagesFromChannel(messages) {
    for (let msg of messages) {
        if (msg && msg.messageType != 'admin') {
            addThisMessageToTheList(msg);
        }
    }
}

/**
 * Draw a chat bubble I sent...
 */
function drawMybubble(msg) {
    const isCustomer = userId != 'sender';
    const formText = drawFormCustomer(msg, isCustomer);
    return `
        <div class="d-flex justify-content-end mb-2" id="${ msg.createdAt }">
            <div class="card bg-light shadow-sm">
                <div class="card-body small">
                    ${ msg.message }
                    ${ formText }
                </div>
            </div>
        </div>
    `;
}

/**
 * Draw a chat bubble other user sent...
 */
function drawOthersBubble(msg) {
    const isCustomer = userId != 'sender';
    const formText = drawFormCustomer(msg, isCustomer);
    return `
        <div class="d-flex justify-content-start mb-2" id="${ msg.createdAt }">
            <div class="card shadow-sm">
                <div class="card-body small">
                    ${ msg.message }
                    ${ formText }
                </div>
            </div>
        </div>
    `;
}

/**
 * Send a message from input box
 */
function sendNewMessage() {
    const newMessage = document.getElementById('newMessage');
    sendMessage(selectedChannel, newMessage.value, null, (userMessage) => {
        addThisMessageToTheList(userMessage);
        newMessage.value = '';
        newMessage.focus();
    })
}

/**
 * Adds any message object to the list of messages on the right.
 */
function addThisMessageToTheList(message) {
    if (message.sender) {
        if (message.sender.userId == userId) {
            document.getElementById('messageList').innerHTML += drawMybubble(message);
        } else {
            document.getElementById('messageList').innerHTML += drawOthersBubble(message);
        }
        var ele = document.getElementById("" + message.createdAt);
        ele.scrollIntoView();
    }
}

/**
 * Shows for sender only the total 
 * amount of messages with CUSTOM_TYPE = 'CONFIRMED'
 */
function getAllConfirmedMessages() {
    if (userId != 'sender') {
        return;
    }
    findMessagesByCustomType(selectedChannel, 'CONFIRMED', [], (allMessages) => {
        console.log('allMessages', allMessages);
        document.getElementById('confirmedOrdersDiv').innerHTML = `
            You have ${ allMessages.length } <br>confirmed orders!
        `;
    })
}
