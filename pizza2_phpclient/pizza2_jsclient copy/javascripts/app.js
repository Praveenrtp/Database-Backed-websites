"use strict";
// avoid warnings on using fetch and Promise --
/* global fetch, Promise */
// use port 80, i.e., apache server for webservice execution 
// Change localhost to localhost:8000 to use the tunnel to pe07's port 80
const baseUrl = "http://localhost/cs637/praveen/pizza2_server/api";
// globals representing state of data and UI
let selectedUser = 'none';
let selectedID = 'none';
let sizes = [];
let toppings = [];
let users = [];
let orders = [];
let main = function () {//(sizes, toppings, users, orders) {
    setupTabs();  // for home/order pizza 
    // for home tab--
    displaySizesToppingsOnHomeTab();
    setupUserForm();
    setupRefreshOrderListForm();
    setupAcknowledgeForm();
    displayOrders();
    // for order tab--
    setupOrderForm();
    displaySizesToppingsOnOrderForm();
};

// Suggested step 1: implement this, should see sizes displayed
// Suggested step 2: implement get_toppings, etc. so this shows toppings too
function displaySizesToppingsOnHomeTab() {
    // find right elements to build lists in the HTML
    // loop through sizes, creating <li>s for them
    // with class=horizontal to get them to go across horizontally
    // similarly with toppings
	
	//For sizes
	var sizesOnHomeTab = document.querySelector("#sizes");
	var lenOfSizes = sizes.length;
	
	//For Toppings
	var toppingsOnHomeTab = document.querySelector("#toppings");
	var lenOfToppings = toppings.length;
	
	for (var i = 0; i < lenOfSizes; i++) {
        var listCreate = document.createElement("li");
        listCreate.className = "horizontal";
		listCreate.innerHTML=sizes[i]['size'];
        sizesOnHomeTab.appendChild(listCreate);
    }
    
    for(var i = 0; i < lenOfToppings; i++) {
        var listCreate = document.createElement("li");
        listCreate.className = "horizontal";
		listCreate.innerHTML=toppings[i]['topping'];
        toppingsOnHomeTab.appendChild(listCreate);
    }
}

// Suggested step 3: implement this, and get_users
function setupUserForm() {
    // find the element with id userselect
    // create <option> elements with value = username, for
    // each user with the current user selected, 
    // plus one for user "none".
    // Add a click listener that finds out which user was
    // selected, make it the "selectedUser", and fill it in the
    //  "username-fillin" spots in the HTML.
    //  Also change the visibility of the order-area
    // and redisplay the orders
	
	var userSelection = document.querySelector("#userselect");
    var data = document.createTextNode("none");
	var optionSelect = document.createElement("option");
	var userLength = users.length;
    
	optionSelect.appendChild(data);
    userSelection.appendChild(optionSelect)
    
	for (var i = 0; i < userLength; i++) {
		optionSelect = document.createElement("option");
        optionSelect.name = users[i].username;
		optionSelect.value = users[i].id;
        data = document.createTextNode(`${users[i].username}`);
        optionSelect.appendChild(data);
        userSelection.appendChild(optionSelect);
    }
	
    var buttonCreation = document.querySelector("#userform input");
    buttonCreation.addEventListener("click", runEvent);
    function runEvent(e){
        e.preventDefault();
        displayOrders();
    }
}

// suggested step 7, and needs update_order
function setupAcknowledgeForm() {
    console.log("setupAckForm...");
    document.querySelector("#ackform input").addEventListener("click", event => {
        console.log("ack by user = " + selectedUser);
        // find this user's info in users, and their selectedUserId
        // selectedUserId = 6; // bogus value for now
        orders.forEach(function (order) {
            console.log("cking order = %O", order);
            if (order.user_id == selectedID && order.status === 'Baked') {
                console.log("Found baked order for user " + order.username);
                order.status = 'Finished';
                updateOrder(order, () => console.log("back from fetch for upd")); // post update to server
            }
        });
        displayOrders();
        event.preventDefault();
    });
}

// suggested steps: this should work once displayOrders works
function setupRefreshOrderListForm() {
    console.log("setupRefreshForm...");
    document.querySelector("#refreshbutton input").addEventListener("click", event => {
        console.log("refresh orders by user = " + selectedUser);
        getOrders(() => displayOrders());
        event.preventDefault();
    });
}

// suggested step 4, and needs get_orders
function displayOrders() {
    console.log("displayOrders");

    // remove class "active" from the order-area
    // if selectedUser is "none", just return--nothing to do
    // empty the ordertable, i.e., remove its content: we'll rebuild it
    // add class active to order-area
    // find the user_id of selectedUser via the users array
    // find the in-progress orders for the user by filtering array 
    // orders on user_id and status
    // if there are no orders for user, make ordermessage be "none yet"
    //  and remove active from element id'd order-info
    // Otherwise, add class active to element order-info, make
    //   ordermessage be "", and rebuild the order table 
    // Finally, if there are Baked orders here, make sure that
    // ackform is active, else not active
	
	var userInfo = document.querySelector("#userselect");
	var userName = userInfo.options[userInfo.selectedIndex].text;
	var userID = document.querySelector("#userselect").value;
	var userOrderPreparing = [];
	var userOrderBaked = [];
	if(userName == 'none') {
		document.querySelector("#order-area").classList.remove("active");
	} else {
		selectedUser = userName;
		selectedID = userID;
		document.querySelector("#order-area").classList.add("active");
	}
	document.querySelector("#username-fillin1").innerHTML = userName;
	var orderLength = orders.length;
	for(var i = 0; i < orderLength; i++) {
		if(orders[i].user_id === userID && orders[i].status === "preparing") {
			userOrderPreparing.push(orders[i])
		} else if(orders[i].user_id === userID && orders[i].status === "baked") {
			userOrderBaked.push(orders[i]);
		}
	}
	var lengthOfPreparingOrder = userOrderPreparing.length;
	var lengthOfBakedOrder = userOrderBaked.length;
	
	if(lengthOfPreparingOrder == 0 && lengthOfBakedOrder == 0) {
		document.querySelector("#ordermessage").innerHTML = "<br>No Order In Progress For this User";
	} else {
		document.querySelector("#ordermessage").innerHTML = "";
		var table = document.querySelector("#ordertable");
		var tbody = document.createElement("tbody");
		var tableRow1 = document.createElement("tr");
		var tableHeader1 = document.createElement("th");
		var tableHeader2 = document.createElement("th");
		var tableHeader3 = document.createElement("th");
		var tableHeader4 = document.createElement("th");
		
		tableHeader1.innerHTML = "Order ID";
		tableHeader2.innerHTML = "Size";
		tableHeader3.innerHTML = "Topping";
		tableHeader4.innerHTML = "Status";
		
		tableRow1.appendChild(tableHeader1);
		tableRow1.appendChild(tableHeader2);
		tableRow1.appendChild(tableHeader3);
		tableRow1.appendChild(tableHeader4);
		
		table.appendChild(tableRow1);
		
		
		for (var i = 0; i < lengthOfBakedOrder; i++) {
			var tableRow2 = document.createElement("tr");
			var tableDiv1 = document.createElement("td");
			var tableDiv2 = document.createElement("td");
			var tableDiv3 = document.createElement("td");
			var tableDiv4 = document.createElement("td");
			
			tableDiv1.innerHTML = userOrderBaked[i].id;
			tableDiv2.innerHTML = userOrderBaked[i].size;
			tableDiv3.innerHTML = userOrderBaked[i].topping;
			tableDiv4.innerHTML = userOrderBaked[i].status;
			
			tableRow2.appendChild(tableDiv1);
			tableRow2.appendChild(tableDiv2);
			tableRow2.appendChild(tableDiv3);
			tableRow2.appendChild(tableDiv4);
			
			table.appendChild(tableRow2);
		}
		
		for (var i = 0; i < lengthOfPreparingOrder; i++) {
			var tableRow2 = document.createElement("tr");
			var tableDiv1 = document.createElement("td");
			var tableDiv2 = document.createElement("td");
			var tableDiv3 = document.createElement("td");
			var tableDiv4 = document.createElement("td");
			
			tableDiv1.innerHTML = userOrderPreparing[i].id;
			tableDiv2.innerHTML = userOrderPreparing[i].size;
			tableDiv3.innerHTML = userOrderPreparing[i].toppings;
			tableDiv4.innerHTML = userOrderPreparing[i].status;
			
			tableRow2.appendChild(tableDiv1);
			tableRow2.appendChild(tableDiv2);
			tableRow2.appendChild(tableDiv3);
			tableRow2.appendChild(tableDiv4);
			
			table.appendChild(tableRow2);
		}
		document.querySelector("#order-info").classList.add("active");
	}
}

// suggested step 8: have order form hidden until needed
// Let user click on one of two tabs, show its related contents.
// Contents for both tabs are in the HTML after initial setup, 
// but one part is not displayed because of display:none in its CSS
// made effective via class "active".
// Note you need to remove the extra "active" in the originally provided
// HTML near the comment "active here to make everything show"
function setupTabs() {
    console.log("starting setupTabs");

    // Do this last. You may have a better approach, but here's one
    // way to do it. Also edit the html for better initial settings
    // of class active on these elements.    
    // Find an array of span elements for the tabs and another
    //  array of elements with class tabContent, the content for each tab.
    // Then tabSpan[0] is the first span and tabContent[0] is the
    // corresponding contents for that tab, and similarly with [1]s.
    // Then loop through the two cases i=0 and i=1:
    //   loop through tabSpan removing all class active's
    //   loop through tabContents removing all class active's
    //   set tabSpan[i]'s element active
    //   set tabContent[i]'s element active
	
	var homeButton = document.querySelector("#home-btn");
    var OrderButton = document.querySelector("#order-btn");
    homeButton.addEventListener("click", (e) => {
        document.querySelector("#home").classList.add("active");
        homeButton.className = "active";
        document.querySelector("#order_pizza").classList.remove("active");
        OrderButton.className = "";
    })
    OrderButton.addEventListener("click", (e) => {
        document.querySelector("#home").classList.remove("active");
        homeButton.className = "";
        document.querySelector("#order_pizza").classList.add("active");
        OrderButton.className = "active";
    })
}

// suggested step 5
function displaySizesToppingsOnOrderForm() {
    console.log("displaySizesToppingsOnOrderForm");
    // find the element with id order-sizes, and loop through sizes,
    // setting up <input> elements for radio buttons for each size
    // and labels for them too // and for each topping create an <input> element for a checkbox
    // and a <label> for each
	
	var orderSize = document.querySelector("#order-sizes");
	var sizeLength = sizes.length;
    for(var i = 0; i < sizeLength; i++) {
        var input = document.createElement("input");
        var label = document.createElement("label");
        input.type = "radio";
        input.id = "pizza_size"
        input.value = sizes[i].size;
		label.innerHTML = `&nbsp;${sizes[i].size}`;
        orderSize.appendChild(input);
        orderSize.appendChild(label);
    }
    var orderToppings = document.querySelector("#order-toppings");
	var toppingLength = toppings.length;
    for(var i = 0; i < toppingLength; i++) {
        var input = document.createElement("input");
        var label = document.createElement("label");
        input.type = "checkbox";
        input.id = "pizza_topping";
        input.value = toppings[i].id;
		label.innerHTML = `&nbsp;${toppings[i].topping}`; 
        orderToppings.appendChild(input);
        orderToppings.appendChild(label);
    }

}

// suggested step 6, and needs post_order
function setupOrderForm() {
    console.log("setupOrderForm...");

    // find the orderform's submitbutton and put an event listener on it
    // When the click event comes in, figure out the sizeName from
    // the radio button and the toppings from the checkboxes
    // Complain if these are not specified, using order-message
    // Else, figure out the user_id of the selectedUser, and
    // compose an order, and post it. On success, report the
    // new order number to the user using order-message



}

// Plain modern JS: use fetch, which returns a "promise"
// that we can combine with other promises and wait for all to finish
function getSizes() {
    let promise = fetch(
            baseUrl + "/sizes",
            {method: 'GET'}
    )
            .then(// fetch sucessfully sent the request...
                    response => {
                        if (response.ok) { // check for HTTP 200 responsee
                            //  Need the "return" keyword in the following--
                            return response.json();
                        } else {  // throw to .catch below
                            throw Error('HTTP' + response.status + ' ' +
                                    response.statusText);
                        }
                    })
            .then(json => {
                console.log("back from fetch: %O", json);
                sizes = json;
            })
            .catch(error => console.error('error in getSizes:', error));
    return promise;
}

function getToppings() {
    let promise = fetch(
            baseUrl + "/toppings",
            {method: 'GET'}
    )
            .then(// fetch sucessfully sent the request...
                    response => {
                        if (response.ok) { // check for HTTP 200 responsee
                            return response.json();
                        } else {  // throw to .catch below
                            throw Error('HTTP' + response.status + ' ' +
                                    response.statusText);
                        }
                    })
            .then(json => {
                console.log("back from fetch: %O", json);
                toppings = json;
            })
            .catch(error => console.error('error in getToppings:', error));
    return promise;
}

function getUsers() {
var userData = fetch(
        baseUrl + '/users',
        {method: 'GET'}
    )
        .then(
            response => {
                if(response.ok) {
                    return response.json();
                } else {
                    throw Error('HTTP' + response.status + ' ' + response.statusText);
                }
            }
        )
        .then(json => {
            users = json;
        })
        .catch(error => console.log('error in getUsers:', error));
    return userData;
}

function getOrders() {
	var orderData = fetch(
        baseUrl + '/orders',
        {method: 'GET'}
    )
    .then (
        response => {
            if(response.ok) {
                return response.json();
            } else {
                throw Error('HTTP' + response.status + ' ' + response.statusText);
            }
        }
    )
    .then(json => {
        orders = json;
    })
    .catch(error => console.log('error in getOrders:', error));
    return orderData;
}

function updateOrder(order) {
	var updateData = fetch(
        baseUrl + '/orders',
        {
            method: 'PUT',
            body: JSON.stringify(order),
            headers: {
                'Content-type': "application/json"
            }
        }
    )
    .then(response => response.json())
    .catch(error => console.error("Error: ", error));
	return updateData;
}

function postOrder(order, onSuccess) {
	var postData = fetch(
        baseUrl + '/orders',
        {
            method: 'POST',
            body: JSON.stringify(order),
            headers: {
            'Content-type': "application/json"
            }
        }
    )
    .then(response => response.json())
    .catch(error => console.log("Error: ", error));
	return postData;
}

function refreshData(thenFn) {
    // wait until all promises from fetches "resolve", i.e., finish fetching
    Promise.all([getSizes(), getToppings(), getUsers(), getOrders()]).then(thenFn);
}

console.log("starting...");
refreshData(main);
