
/**
 * This function draws a form in the chat bubble 
 * with the items defined in the DATA attribute 
 * of the message.
 */
function drawFormCustomer(msg, isCustomer = true) {
    var out = ``;
    if (!msg.data) {
        return out;
    }
    // if this message has a child, then we show it as a confirmed order
    const hasReplies = msg.threadInfo && msg.threadInfo.replyCount > 0;
    if (hasReplies) {
        return `
            <div class="card mt-2">
                <div class="card-body text-muted small text-center">
                    This form has a confirmation. Please see below.
                </div>
            </div>
        `;
    }
    // keep track of the total items selected
    // and total money
    var totalItems = 0;
    var totalMoney = 0;
    // get the data and loop    
    const data = JSON.parse( msg.data );
    // get the status of this message
    const status = data.status;
    // begining of the HTML for the list of items
    out += `
    <div class="card mt-2">
        <div class="card-body">
            <p>Status: <b>${ status == 'Confirmed' ? '<span class="text-success">' + status + '</span>' : '<span class="text-warning">' + status + '</span>' }</b></p>
            <ol class="list-group list-group-numbered">
    `;
    // button to confrim the order
    const buttonToSendForm = isCustomer && status != 'Confirmed' ? `
        <button class="btn btn-success btn-sm m-2" onclick="confirmOrder('${ msg.messageId }')">
            Confirm
        </button>
    ` : ``;
    // customer can enter text to send later
    const moreComments = isCustomer && status != 'Confirmed' ? `
        <textarea id="comments-${ msg.messageId }" class="form-control form-control-sm mt-2" placeholder="Any comments?"></textarea>
    ` : ``;
    // check if have product items
    if (!data.items && !Array.isArray(data.items)) {
        return '';
    }
    // iterate product items
    for (let item of data.items) {
        // build buttons for + and - only if this is a customer
        const buttons = isCustomer && status != 'Confirmed' ? `
            <span class="badge bg-secondary rounded-pill" style="cursor:pointer; padding-top:6px;" onclick="substractOneFromItem('${ msg.messageId }', '${ item.code }')">
                -
            </span>
            <div style="width:30px" class="text-center">
                ${ item.cant }
            </div>
            <span class="badge bg-secondary rounded-pill" style="cursor:pointer; padding-top:6px;" onclick="addOneToItem('${ msg.messageId }', '${ item.code }')">
                +
            </span>
        ` : `
            <div style="width:30px" class="text-center">
                ${ item.cant }
            </div>
        `;
        // build the output
        out += `
            <li class="list-group-item d-flex justify-content-between align-items-start mb-1">
                <div class="ms-2 me-auto">
                    <div style="padding-right:1rem">
                        <div class="fw-bold">${ item.title }</div>
                        ${ item.description }
                    </div>
                </div>
                <div class="text-center">
                    <span class="badge bg-primary rounded-pill">$${ item.price }</span>
                    <div class="mt-2 d-flex">
                        ${ buttons }
                    </div>
                </div>
            </li>    
        `;    
        // increase item count and money spent
        totalItems += item.cant;
        totalMoney += ( parseFloat(item.cant) * parseFloat(item.price) );
    }
    // show the totals
    out += `
            </ol>
            <div class="text-center">
                ${ totalItems } items - Total: <b>$${ totalMoney.toFixed(2) }</b> ${ buttonToSendForm }
            </div>
            ${ moreComments }
        </div>
    </div>
    `;
    // finally, return all the HTML
    return out;
}

/**
 * Function called when customer adds more 
 * to their order.
 */
function addOneToItem(messageId, itemCode) {
    const msg = messagesOnScreen.find(i => i.messageId == messageId);
    if (!msg || !msg.data) {
        return msg;
    }
    const data = JSON.parse( msg.data );
    for (let item of data.items) {
        if (item.code == itemCode) {
            item.cant ++;
            break;
        }
    }
    msg.data = JSON.stringify( data );
    scrollToCurrentMessage();
}

/**
 * Function called when customer removes  
 * from their order.
 */
function substractOneFromItem(messageId, itemCode) {
    const msg = messagesOnScreen.find(i => i.messageId == messageId);
    if (!msg || !msg.data) {
        return msg;
    }
    const data = JSON.parse( msg.data );
    for (let item of data.items) {
        if (item.code == itemCode) {
            item.cant --
            break;
        }
    }
    msg.data = JSON.stringify( data );
    scrollToCurrentMessage();
}

/**
 * Helper function to scroll back to the message
 * we are modifying once the quantity changes.
 */
function scrollToCurrentMessage() {
    var ele = document.getElementById('messageList');
    var scrollPos = ele.scrollTop;
    ele.innerHTML = '';
    drawMessagesFromChannel(messagesOnScreen);
    ele.scrollTo(0, scrollPos);
}

/**
 * Button to send a reply to the message from a sender.
 * This is the confirmation of our order.
 */
function confirmOrder(messageId) {
    const msg = messagesOnScreen.find(i => i.messageId == messageId);
    if (!msg || !msg.data) {
        return msg;
    }
    const data = JSON.parse( msg.data );
    data.status = 'Confirmed';
    const message = document.getElementById('comments-' + messageId).value;
    if (!message) {
        alert('Please enter a comment');
        return;
    }
    sendMessageResponse(selectedChannel, messageId, message, data, (userMessage) => {
        getMyMessages(selectedChannel.url);
    })
}

