'use strict';
var Alexa = require('alexa-sdk');
//var http = require('http');
var appId = "amzn1.ask.skill.58209367-b356-46f7-9e21-538d24522b73";

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
	alexa.appId=appId;
    alexa.registerHandlers(newSessionHandlers, transHandlers);
    alexa.execute();
};

var states = {
    TRANMODE: '_TRANMODE',
	WLCMMODE: '_WLCMMODE',
};
var origIntent="";
var userName = "";
var secretPin = 0;
var userSession = false;
var cartCount = 0;
var cartName = "MyCart";
var cartList = ["My Cart"];
var welcomeMessage = "Welcome to K.N.B Department Store";
var welcomeRepromt = "Hello, "+welcomeMessage;
var authMessage = "Please say your user name and secret pin to authenticate yourself?";
var goodbyeMessage = "Thanks for shopping with K.N.B Department Store";
var HelpMessage = "Sorry I couldn't get that, how may I help you";
var opsMsg="What would you like to do? You can add items, remove items, list the items in your cart or checkout the items from your cart";

var newSessionHandlers = {
    'LaunchRequest': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
        this.handler.state = states.WLCMMODE;
        output = welcomeMessage + authMessage;

		console.log(output);
        this.emit(':ask', output, welcomeRepromt + authMessage);
    },
    'authenticate': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		
		this.handler.state = states.WLCMMODE;
		
		var userNameSlot = this.event.request.intent.slots.userName;
		console.log(userNameSlot);
		if (userNameSlot !== undefined)
		{
			userName = userNameSlot.value;
			console.log("user name set as "+userName);
		}
		/*else
		{
			//request user to authenticate again
			//userName = "nandha";
		}*/
		var secretPinSlot = this.event.request.intent.slots.secretPin;
		if (secretPinSlot !== undefined)
		{
			secretPin = parseInt(secretPinSlot.value);
			console.log("secret pin set as "+secretPin);
		}
		/*else
		{
			secretPin = 123;
		}*/
		console.log(userName+secretPin);
		authenticate(userName, secretPin);
		if (userSession)
		{
			var respMsg = "";
			if (cartCount==1)
			{
				if (origIntent.trim().length > 0)
				{
					console.log("origIntent"+origIntent);
					this.handler.state = states.TRANMODE;
					this.emitWithState(origIntent);
					origIntent="";
				}
				else
				{
					respMsg = opsMsg;
					console.log(respMsg);
					this.handler.state = states.TRANMODE;
					this.emit(':ask', respMsg, "Hello, "+respMsg);
				}
				
			}
			else
			{
				respMsg = "You have "+listItemsInArray(cartList)+". Which one should I open? ";
				console.log(respMsg);
				this.handler.state = states.TRANMODE;
				this.emit(':ask', respMsg, "Hello, "+respMsg);
			}
		}
		else
		{
			this.handler.state = '';
			this.emit(':ask', "Sorry unable to authenticate you, Please say your user name and secret pin to authenticate yourself?", "Hello, Sorry unable to authenticate you, Please say your user name and secret pin to authenticate yourself?");
		}
    },
	'openCart': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (userSession)
		{
			this.handler.state = states.TRANMODE;
			this.emitWithState('openCart');
		}
        else
		{
			origIntent="openCart";
			this.emit('authenticate');
		}
    },
	'listCartItems': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (userSession)
		{
			this.handler.state = states.TRANMODE;
			this.emitWithState('listCartItems');
		}
        else
		{
			origIntent="listCartItems";
			this.emit('authenticate');
		}
    },
	'addItemsToCart': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (userSession)
		{
			this.handler.state = states.TRANMODE;
			this.emitWithState('addItemsToCart');
		}
        else
		{
			origIntent="addItemsToCart";
			this.emit('authenticate');
		}
    },
	'removeItemsFromCart': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (userSession)
		{
			this.handler.state = states.TRANMODE;
			this.emitWithState('removeItemsFromCart');
		}
        else
		{
			origIntent="removeItemsFromCart";
			this.emit('authenticate');
		}
    },
	'checkOutItemsInCart': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (userSession)
		{
			this.handler.state = states.TRANMODE;
			this.emitWithState('checkOutItemsInCart');
		}
        else
		{
			origIntent="checkOutItemsInCart";
			this.emit('authenticate');
		}
    },
    'AMAZON.StopIntent': function () {
		clearAllValues();
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.CancelIntent': function () {
        // Use this function to clear up and save any data needed between sessions
		clearAllValues();
        this.emit(":tell", goodbyeMessage);
    },
    'SessionEndedRequest': function () {
        // Use this function to clear up and save any data needed between sessions
        this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function () {
        output = HelpMessage;
        this.emit(':ask', output, welcomeRepromt);
    },
};

var transHandlers = Alexa.CreateStateHandler(states.TRANMODE, {
    'LaunchRequest': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
        output = "Hello "+dotSeparatedString(userName)+ " "+opsMsg;
        this.emit(':ask', output, output);
    },
    'authenticate': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (!userSession)
		{
			this.handler.state = states.WLCMMODE;
			this.emit('authenticate');
		}
    },
	'openCart': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (userSession)
		{
			var cartName = this.event.request.intent.slots.cartName.value;
			console.log("loading cart "+cartName);
			loadCart(cartName);
			this.emit(':ask', opsMsg, "Hello, "+opsMsg);
		}
        else
		{
			console.log("No user session");
			this.handler.state = states.WLCMMODE;
			origIntent = "openCart";
			this.emit('authenticate');
		}
    },
	'listCartItems': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (userSession)
		{
			var cartNameFromUser = this.event.request.intent.slots.cartName.value;
			if (cartNameFromUser !== undefined)
			{
				if (cartNameFromUser.trim().length()==0)
				{
					cartNameFromUser = cartName;
				}
			}
			else
			{
				cartNameFromUser = cartName;
			}
				console.log("list items in cart "+cartNameFromUser);
				var itemsList = listCartItems(cartNameFromUser);
				this.emit(':tell',itemsList);
				//this.emit(':ask', opsMsg, "Hello, "+opsMsg);
		}
        else
		{
			console.log("No user session");
			this.handler.state = states.WLCMMODE;
			origIntent = "listCartItems";
			this.emit('authenticate');
		}
    },
	'addItemsToCart': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (userSession)
		{
			var itemName = this.event.request.intent.slots.itemName.value;
			var qty = parseInt(this.event.request.intent.slots.qty.value);
			addItemToCart(itemName, qty);
			console.log("add items "+itemName+" to cart "+cartName);
			this.emit(':tell',"Add "+qty+" "+itemName + " to "+cartName);
			//this.emit(':ask', opsMsg, "Hello, "+opsMsg);
		}
        else
		{
			console.log("No user session");
			this.handler.state = states.WLCMMODE;
			origIntent = "addItemsToCart";
			this.emit('authenticate');
		}
    },
	'removeItemsFromCart': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (userSession)
		{
			var itemName = this.event.request.intent.slots.itemName.value;
			removeItemsInCart(itemName);
			console.log("remove items "+itemName+" to cart "+cartName);
			this.emit(':tell',"Removed "+itemName + " from "+cartName);
			//this.emit(':ask', opsMsg, "Hello, "+opsMsg);
		}
        else
		{
			console.log("No user session");
			this.handler.state = states.WLCMMODE;
			origIntent = "removeItemsFromCart";
			this.emit('authenticate');
		}
    },
	'checkOutItemsInCart': function () {
		console.log(this.event.request.intent);
		console.log(this.handler.state);
		if (userSession)
		{
			checkOutCart(cartName);
			console.log("checkout cart "+cartName);
			this.emit(':tell',"Items in the cart are checked out. Payment and delivery details are sent your registered email address");
			//this.emit(':ask', opsMsg, "Hello, "+opsMsg);
		}
        else
		{
			console.log("No user session");
			this.handler.state = states.WLCMMODE;
			origIntent = "checkOutItemsInCart";
			//this.emit('authenticate');
		}
    },
    'AMAZON.StopIntent': function () {
		clearAllValues();
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.CancelIntent': function () {
        // Use this function to clear up and save any data needed between sessions
		clearAllValues();
        this.emit(":tell", goodbyeMessage);
    },
    'SessionEndedRequest': function () {
        // Use this function to clear up and save any data needed between sessions
        this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function () {
        output = HelpMessage;
        this.emit(':ask', output, welcomeRepromt);
    },
});

function authenticate(userName, secretPin)
{
	//REST API call to KNB Service
	if (userName=="nandha" && secretPin== 123)
	{
		userSession = true;
		console.log("Authentication successfull");
	}
	else
	{
		console.log("Authentication failed for "+userName);
	}
	//REST Call to get Cart Details
	if (userSession)
	{
		//REST Call here to get cart count
		cartCount = 1;
		if (cartCount==1)
		{
			loadCart("MyCart");
		}
		else
		{
			//REST Call to get 
			var cartList= listCarts(userName);
			cartCount = Object.keys(cartList).length
		}
	}
	
}
function loadCart(cartName)
{
	//Rest Call to load items in cart
}
function listCarts(userName)
{
	//Rest Call to get the list of carts the user owns
	var cartList = ["My Cart", "Diwali Cart"];
	return cartList;
}
function listCartItems(cartName)
{
	//Rest Call to add items in cart
	return "One Kellogs Corn flakes";
}
function addItemToCart(itemName, cartName)
{
	//Rest Call to add items in cart
}
function removeItemsInCart(itemName, cartName)
{
	//Rest Call to remove items in cart
}
function checkOutCart(cartName)
{
	//Rest Call to checkout items in cart
}
function listItemsInArray(jsonArray)
{
	return "MyCart and DiwaliCart";
}
function dotSeparatedString(value)
{
	// to implement later
	return value;
}