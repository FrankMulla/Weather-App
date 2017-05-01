var locationInputRef = document.getElementById("LocationName");
var locationNickInputRef = document.getElementById("LocationNickname");
var loadingMapRef = document.getElementById("mapLoadingBar");

var currentLocation = {};
//On user type and enter in location input box calls the geo coding function
updatedLocation = function() {
	codeAddress()
};
///////////////// Styling and display bases from http://www.w3schools.com/jsref/prop_style_visibility.asp //////////////////////////
//function to start the loading bar for the map
function mapLoading(){
    loadingMapRef.style.display = 'block';
}
//function to stop the loading bar for the map
function mapStopLoad(){
    loadingMapRef.style.display = 'none';
}
//Add location checks if the location status is okay and the length of the name to avoid display errors and input errors
//After then prompts the user if there is a concern on the name or google location status
//Adds to the locations list and goes to home page
function addLocations()
{
    if (currentLocation.status == "OK") {
        if (locationNickInputRef.value.length != 0) {
            if (locationNickInputRef.value.length >= 56) {
                var insertDecision = confirm("The characters in the nickname may have too many to show immediate weather on Launch Page (if using a portrait display)!\nPress OKAY To Continue Or Cancel And Enter Another Nickname...");
                if (insertDecision) {
                    WeatherCache.addLocation(currentLocation.lat, currentLocation.lng, locationNickInputRef.value);
                }
                }
            else {
                WeatherCache.addLocation(currentLocation.lat, currentLocation.lng, locationNickInputRef.value);
            }
        }
        else{
            if (currentLocation.officialName.length >= 56) {
                var insertDecision = confirm("The characters in the name may have too many to show immediate weather on Launch Page (if using a portrait display)! \nPress OKAY To Continue Or Cancel And Enter A Nickname...");
                if (insertDecision){
                    WeatherCache.addLocation(currentLocation.lat, currentLocation.lng, currentLocation.officialName);
                }
            }
            else{
                WeatherCache.addLocation(currentLocation.lat, currentLocation.lng, currentLocation.officialName);
            }
        }
    }
    else{
        alert("Error - Please Refine your locations search")
    }
}
////////////// Map and Geocode bases from https://developers.google.com/maps/documentation/javascript/examples/map-geolocation/////////////

// geocoder function
var geocoder;
var Map;
var marker;
//Callback start map function to intialise the map centred at global central
startMap = function() {
    geocoder = new google.maps.Geocoder();
    var globalCentral = {lat: 0, lng: 0};
    Map = new google.maps.Map(document.getElementById("MapCanvas"), {
        zoom: 1,
        center: globalCentral
    });
    setTimeout(mapStopLoad, 2000);//time allowing map to fully load
};
//geocoding function thats called everytime the user types in to simultaneously look up the requested location
//saves the centred location coordinates and status in current location object
function codeAddress() {
    var address = locationInputRef.value;
    var infoWindow = new google.maps.InfoWindow({map: Map});
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            currentLocation = JSON.parse(JSON.stringify(results[0].geometry.location));//gave errors without the stringify and parse
            var infoWindowAddress = results[0].formatted_address;
            currentLocation.officialName = results[0].formatted_address;
            if (marker != undefined) {
                marker.setMap(null);
            }
            Map.setCenter(currentLocation);
            Map.setZoom(11);
            marker = new google.maps.Marker({
                map: Map,
                position: currentLocation
            });
            infoWindow.setContent(infoWindowAddress);
            infoWindow.open(Map, marker);
        }
        else {
            if (status != "ZERO_RESULTS" && status != "OVER_QUERY_LIMIT") {
                alert("Geocode was not successful for the following reason: " + status);
            }
        }
        currentLocation.status = status;
    });
}



