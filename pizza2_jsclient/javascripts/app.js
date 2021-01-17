"use strict";
// avoid warnings on using fetch and Promise --
/* global fetch, Promise */
// use port 80, i.e., apache server for webservice execution 
// Change localhost to localhost:8000 to use the tunnel to pe07's port 80
const baseUrl = "http://pe07.cs.umb.edu/cs637/praveen/pizza2_server/api";
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


function displaySizesToppingsOnHomeTab() {
   
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


function setupUserForm() {
    
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

function setupAcknowledgeForm() {
    console.log("setupAckForm...");
    document.querySelector("#ackform input").addEventListener("click", event => {
        console.log("ack by user = " + selectedUser);
        
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

function setupRefreshOrderListForm() {
    console.log("setupRefreshForm...");
    document.querySelector("#refreshbutton input").addEventListener("click", event => {
        console.log("refresh orders by user = " + selectedUser);
        getOrders(() => displayOrders());
        event.preventDefault();
    });
}

function displayOrders() {
    console.log("displayOrders");
	
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
		document.querySelector("#ordermessage").innerHTML = "";
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


function setupTabs() {
    console.log("starting setupTabs");
	
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

function displaySizesToppingsOnOrderForm() {
    console.log("displaySizesToppingsOnOrderForm");
    
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
