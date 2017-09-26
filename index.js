var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();
var rmkFeedLink = process.env.RMK_JOB_FEED;
var VERIFY_TOKEN = process.env.VERIFY_TOKEN;
var TOKEN = process.env.ACCESS_TOKEN;

app.set('port', (process.env.PORT || 5000));

// Allows us to process the data
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// ROUTES

app.get('/', function(req, res) {
	res.send("Hi I am a chatbot")
});

// Facebook

app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong token")
});

app.post('/webhook/', function(req, res) {
	var messaging_events = req.body.entry[0].messaging
	for (var i = 0; i < messaging_events.length; i++) {
		var event = messaging_events[i]
		var sender = event.sender.id
		if (event.message && event.message.text) {
			var text = event.message.text
			sendText(sender, "Text echo: " + text.substring(0, 100))
		}
	}
	res.sendStatus(200)
});

function sendText(sender, text) {
	var messageData = {text: text}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: TOKEN},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}
	})
}

app.listen(app.get('port'), function() {
	console.log("running: port")
});
