// Code for the View Location page.

var locationObj;//location object which will always have details on current location
var locationIndex = localStorage.getItem(APP_PREFIX + "-selectedLocation");
var loadingBarRef = document.getElementById("loadingBar");
var loadingMapRef = document.getElementById("mapLoadingBar");
//Setting title to appropriate name for location
if (locationIndex !== null) {
    if (locationIndex == "-1") {
        document.getElementById("headerBarTitle").textContent = "Current Location";
        document.getElementById("removeLocationButton").style.visibility = 'hidden';
        //locationObj = the current location
    }
    else {
        locationObj = WeatherCache.locationAtIndex(locationIndex);
        // If a location name was specified, use it for header bar title.
        document.getElementById("headerBarTitle").textContent = locationObj.Nickname;
        document.getElementById("removeLocationButton").style.visibility = 'visible';
    }
}
//Function to ensure the loading bar is started
///////////////// Styling and display bases from http://www.w3schools.com/jsref/prop_style_visibility.asp //////////////////////////
function mapLoading() {
    loadingMapRef.style.display = 'block';
}
//Function to stop the loading bar
function mapStopLoad() {
    loadingMapRef.style.display = 'none';
}
//function to show the normal summary loading bar
function showLoading() {
    loadingBarRef.style.display = 'block';
}
//Function to stop the loading bar for summary
function hideLoading() {
    loadingBarRef.style.display = 'none';
}

////////////// Map and Geocode bases from https://developers.google.com/maps/documentation/javascript/examples/map-geolocation /////////////
var Map;
var marker;
var infoWindow;
var circle;
////since the location will be updating we dont want the infowindows to pile up

//Map start callback function centred at requested location
startMap = function () {
    if (locationIndex == -1) {
        var globalCentral = {lat: 0, lng: 0};
        Map = new google.maps.Map(document.getElementById("MapCanvas"), {
            zoom: 1,
            center: globalCentral
        });
        Geocode();
        setInterval(Geocode, 5000);//Constantly Checks and thr users location every 5 seconds to updates the current location
    }
    else {
        var mapCentral = {lat: locationObj.Latitude, lng: locationObj.Longitude};
        Map = new google.maps.Map(document.getElementById("MapCanvas"), {
            zoom: 14,
            center: mapCentral
        });
        marker = new google.maps.Marker({
            map: Map,
            position: mapCentral
        });
        infoWindow = new google.maps.InfoWindow;
        infoWindow.setContent(locationObj.Nickname);
        infoWindow.open(Map, marker);
    }
    setTimeout(mapStopLoad, 2000);//time allowing map to fully load and first geocode location to show
};

//Code to display weather summary from site
DateAreaRef = document.getElementById("WeatherDateArea");
WeatherSummary = document.getElementById("WeatherSummaryArea");
DateAreaRef.innerHTML = "Weather: " + simpleDataFormat(standardDaysCalculator(0));
// function that takes the index in locations list and object ...updates the summary tab with the appropriate details.
///called everytime the slider changes and specified as callback
updateSummary = function (index, WeatherObject) {
    localStorage.setItem(APP_PREFIX + "-selectedLocation", index);
    windSpeed = (WeatherObject.windSpeed / 1000) * (60 * 60);
    windSpeed = windSpeed.toFixed(2);
    outputString = "<p><b>" + "Summary: </b>" + WeatherObject.summary + "<br />";
    outputString += "<b>" + "Minimum Temperature: </b>" + WeatherObject.temperatureMin + "&#8451<br />";
    outputString += "<b>" + "Maximum Temperature: </b>" + WeatherObject.temperatureMax + "&#8451" + "<br />";
    outputString += "<b>" + "Humidity: </b>" + WeatherObject.humidity + "%" + "<br />";
    outputString += "<b>" + "Wind Speed: </b>" + windSpeed + " Km/h" + "<br />";
    outputString += "<b>" + "Cloud Cover: </b>" + WeatherObject.cloudCover + " % Probability " + "<br />";
    outputString += "<b>" + "Pressure: </b>" + WeatherObject.pressure + " Hectopascals" + "<br /></p>";
    WeatherSummary.innerHTML = outputString;
    setTimeout(hideLoading, 500);

};

// Displays the google maps and sets initial to requested current location, handles error locations.
// Sets a circle to the level of accuracy being displayed
function Geocode() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            locationObj = {
                Latitude: position.coords.latitude,
                Longitude: position.coords.longitude
            };
            localStorage.setItem(APP_PREFIX + "currentLocation", JSON.stringify(locationObj));
            if (infoWindow !== undefined) {
                infoWindow.setMap(null);
            }
            infoWindow = new google.maps.InfoWindow;
            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here');
            infoWindow.open(Map, marker);
            Map.setCenter(pos);
            Map.setZoom(14);
            if (circle !== undefined) {
                circle.setMap(null);
            }
            circle = new google.maps.Circle({
                center: pos,
                radius: position.coords.accuracy,
                map: Map,
                fillColor: '#0000FF',
                fillOpacity: 0.5,
                strokeColor: '#0000FF',
                strokeOpacity: 1.0
            });
            Map.fitBounds(circle.getBounds());
        }, function () {
            handleLocationError(true, infoWindow, Map.getCenter());
        });
    }
    else {
        var globalCentral = {lat: 0, lng: 0};
        Map = new google.maps.Map(document.getElementById("MapCanvas"), {
            zoom: 1,
            center: globalCentral
        });
        alert("Location fetch failed - Your Browser doesnt support Geolocation or no permission was given");
    }
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    }
}

//Formats the slider input to alter the date displayed and weather information for the selected day
sliderCallback = function (sliderValue) {
    showLoading();
    sliderValue = sliderValue - 30;
    DateAreaRef.innerHTML = "Weather: " + simpleDataFormat(standardDaysCalculator(sliderValue));
    WeatherCache.getWeatherAtIndexForDate(locationIndex, dateString(standardDaysCalculator(sliderValue)), updateSummary);
};


//function that removes the currently being viewed location from locations list
removeLocation = function () {
    var deleteDecision = confirm("Are you sure you want to delete this location?");
    if (deleteDecision) {
        WeatherCache.removeLocationAtIndex(locationIndex);
        saveLocations();
        location.href = 'index.html'
    }
};
var sliderRef = document.getElementById("slider");
sliderCallback(sliderRef.value);
