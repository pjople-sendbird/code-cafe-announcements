
/**
 * Init Sendbird
 */
var sb = new SendBird({appId: 'YOUR SENDBIRD APPLICATION HERE'});

/**
 * Connect to chat
 */
function connect(userId, functionToCallWhenNewMessageArrives, callback) {
    sb.connect(userId, (user, error) => {
        addHandlers(functionToCallWhenNewMessageArrives);
        callback();
    })
}

/**
 * Add handlers
 */
function addHandlers(functionToCallWhenNewMessageArrives) {
    var channelHandler = new sb.ChannelHandler();
    channelHandler.onMessageReceived = (channel, message) => {
        functionToCallWhenNewMessageArrives(channel, message);
    };
    sb.addChannelHandler('UNIQUE_HANDLER_ID', channelHandler);
}

/**
 * List channels
 */
function listChannels(callback) {
    var listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.includeEmpty = true;
    listQuery.order = 'latest_last_message';
    listQuery.limit = 15;
    if (listQuery.hasNext) {
        listQuery.next((groupChannels, error) => {
            callback(groupChannels);
        })
    }
}

/**
 * Get a Channel object from Sendbird.
 */
function getChannelFromUrl(channelUrl, callback) {
    sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
        callback(groupChannel);
    })
} 

/**
 * List messages from channel
 */
function listMessages(channel, callback) {
    var listQuery = channel.createPreviousMessageListQuery();
    listQuery.limit = 100;
    listQuery.includeThreadInfo = true;
    listQuery.includeReplies = true;
    listQuery.load((messages, error) => {
        callback(messages);
    });
}

/**
 * Send a text message with data (optional)
 */
function sendMessage(channel, message, data, callback) {
    const params = new sb.UserMessageParams();
    params.message = message;
    if (data) {
        params.data = JSON.stringify( data );
    }
    channel.sendUserMessage(params, (userMessage, error) => {
        callback(userMessage);
    })
}

/**
 * Send a response message
 */
 function sendMessageResponse(channel, parentMessageId, message, data, callback) {
    const params = new sb.UserMessageParams();
    params.parentMessageId = parseInt( parentMessageId );
    params.message = message;
    params.customType = 'CONFIRMED';
    if (data) {
        params.data = JSON.stringify( data );
    }
    channel.sendUserMessage(params, (userMessage, error) => {
        console.log(userMessage);
        callback(userMessage);
    })
}

/**
 * Retrieves all messages filtering by custom type
 */
function findMessagesByCustomType(channel, customType, allMessages, callback) {
    var listQuery = channel.createPreviousMessageListQuery();
    listQuery.limit = 100;
    listQuery.includeReplies = true;
    listQuery.customTypeFilter = customType;
    listQuery.load((messages, error) => {
        allMessages.push( ...messages );
        if (listQuery.hasNext) {
            findMessagesByCustomType(channel, customType, allMessages, callback);
        } else {
            callback(allMessages);
        }
    })
}

