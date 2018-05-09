
	<!-- the following script will load the map and set the default view and zoom, as well as loading the basemap tiles -->

	// Load the map - set view and zoom
	var mymap = L.map('mapid').setView([51.505, -0.09], 13);
	// Load the tiles
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			maxZoom: 18,
			// Copyright statement
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + 
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' + 
				'Imagery © <a href="http://mapbox.com">Mapbox</a>', 
			id: 'mapbox.streets'
		}).addTo(mymap);
		
		
	
	
	
	
// function showPosition(position) {
		// L.marker([position.coords.latitude, position.coords.longitude]).addTo(mymap)
			// .bindPopup("<b>Position</b><br />Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude).openPopup();
			// mymap.flyTo([position.coords.latitude, position.coords.longitude], 20);
// }



var question;

// Function to retrieve and show the question text and display the location of the question
function questionShow() {
  questions = JSON.parse(client.responseText);
  question = questions[0]['features'][0]
  navigator.geolocation.clearWatch(watcherId);
  if (client.readyState == 4) {
    // change the DIV to show the question
    document.getElementById("question").innerHTML = question["properties"]["question"]+
		'	<br />'+
		'	<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="correctAnswer1">'+
		'    <input type="radio" id="correctAnswer1" class="mdl-radio__button" name="options" value="question["properties"]["answer1"]">'+
		'		<span class="mdl-radio__label">'+question["properties"]["answer1"]+'</span>'+
		'	</label>'+
		'	<br />'+
		'	<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="correctAnswer2">'+
		'	  <input type="radio" id="correctAnswer2" class="mdl-radio__button" name="options" value="question["properties"]["answer2"]">'+
		'	  <span class="mdl-radio__label">'+question["properties"]["answer2"]+'</span>'+
		'	</label>'+
		'	<br />'+
		'	<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="correctAnswer3">'+
		'	  <input type="radio" id="correctAnswer3" class="mdl-radio__button" name="options" value="question["properties"]["answer3"]">'+
		'	  <span class="mdl-radio__label">'+question["properties"]["answer3"]+'</span>'+
		'	</label>'+
		'	<br />'+
		'	<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="correctAnswer4">'+
		'	  <input type="radio" id="correctAnswer4" class="mdl-radio__button" name="options" value="question["properties"]["answer4"]">'+
		'	  <span class="mdl-radio__label">'+question["properties"]["answer4"]+'</span>'+
		'	</label>'+
		'	<br />'+
		'		<div class="mdl-card__actions mdl-card--border">'+
		'		<a onclick="startDataUpload()" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-color-text--blue-grey-500">Submit Answer</a>'+
        '</div>';
		
	// Show the question location as a marker on the map 
	var marker = L.marker();
	// Set the latitude and longitude coordinates to the question latitude and longitude
	var latlng = [question['geometry']['coordinates'][1], question['geometry']['coordinates'][0]]; 
	marker
		.setLatLng(latlng)
		.addTo(mymap);
	mymap.setView(latlng, 18);
    }
}

var watcherId;

// Function to track the user's location
function trackLocation() {
 if (navigator.geolocation) {
     watcherId = navigator.geolocation.watchPosition(requestNearestQuestion);
 } else {
     document.getElementById('question').innerHTML = "Geolocation is not supported by this browser.";
 }
}

// Function to request the nearest question based on the user's location
function requestNearestQuestion(position) {
  var requestString = "lat="+ position.coords.latitude +"&lng="+position.coords.longitude;
  client = new XMLHttpRequest();
  var url = "http://developer.cege.ucl.ac.uk:30266/closestQuestion?" + requestString;
  client.open('GET', url, true);
  //client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  client.onreadystatechange = questionShow;
  client.send();
}

// Function to send the user's answer to the server
function processData(postString) {
	client = new XMLHttpRequest();
	client.open('POST','http://developer.cege.ucl.ac.uk:30266/submitAnswer',true);
 
	client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	// Code adapted from https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/onreadystatechange
	client.onreadystatechange = function () {
		if(client.readyState === 4 && client.status === 200) {
			console.log("Answer submitted successfully");
		}
	};
   client.send(postString);
}

function onDeviceReady() {
    console.log(device.cordova);
}
document.addEventListener("deviceready", onDeviceReady, false);

// Function to extract user's answer
function startDataUpload() {
	questionText = question['properties']['question'];
	submittedAnswer = 0;
	mobileUUID = 0;

	// Determine which is the answer chosen by the user
	if (document.getElementById("correctAnswer1").checked === true) {
		submittedAnswer = 1;
	}
	else if (document.getElementById("correctAnswer2").checked === true) {
		submittedAnswer = 2;
	}
	else if (document.getElementById("correctAnswer3").checked === true) {
		submittedAnswer = 3;
	}
	else if (document.getElementById("correctAnswer4").checked === true) {
		submittedAnswer = 4;
	}
	// Notify the user of the correct answer
	if (submittedAnswer == question['properties']['correctanswer']) {
		document.getElementById("answerOutcome").innerHTML = "That's correct!";
	}
	else {
		document.getElementById("answerOutcome").innerHTML = "That's incorrect. The correct answer is "+question['properties']['correctanswer'];
	}
	//Set up variables from parameters
	var postString = "question="+question+"&submittedAnswer="+submittedAnswer+"&mobileUUID="+mobileUUID;
	processData(postString);
}


// Function to dynamically change the main div to the User Guide
var xhr; // define the global variable to process the AJAX request
function callDivChange() {
	xhr = new XMLHttpRequest();
	xhr.open("GET", "quizUserGuide.html", true);
	xhr.onreadystatechange = processDivChange;
	try {
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	}
	catch (e) {
		// this only works in internet explorer
	}
	xhr.send();
}

function processDivChange() {
	if (xhr.readyState < 4) // while waiting response from server
		document.getElementById('main').innerHTML = "Loading...";
	else if (xhr.readyState === 4) { // 4 = Response from server has been completely loaded.
		if (xhr.status == 200 && xhr.status < 300)
			// http status between 200 to 299 are all successful
			document.getElementById('main').innerHTML = xhr.responseText;
	}
}