var WeatherCache = new LocationWeatherCache();
////Location Weather Cache JS

//// Date functions
////////////All date object details bases from skeleton code and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date///

//Returns the date of the current day 12:00 hrs plus or minus a specified number of days as the standard date to local time
function standardDaysCalculator(numberOfDays) {
    var d = new Date();
    d.setDate(d.getDate() + numberOfDays);
    d.setHours(12, 0, 0, 0);
    return d
}

// Returns a date in the format "YYYY-MM-DDTHH:MM:SS" for the forecasters.
function FormatDate() {
    var date = new Date();
    Date.prototype.simpleDateString = function () {
        function pad(value) {
            return ("0" + value).slice(-2);
        }

        var dateString = this.getFullYear() + "-" +
            pad(this.getMonth() + 1, 2) + '-' +
            pad(this.getDate(), 2);

        return dateString;
    };
    // Date format required by forecast.io API.
    // We always represent a date with a time of midday,
    // so our choice of day isn't susceptible to time zone errors.
    Date.prototype.forecastDateString = function () {
        return this.simpleDateString() + "T12:00:00";
    };
    return date.forecastDateString()
}
//returns a simple date format in format "YYYY-MM-DD" from given date object used in view location page without the time
function simpleDataFormat(baseDate) {
    var date = new Date(baseDate);
    Date.prototype.simpleDateString = function () {
        function pad(value) {
            return ("0" + value).slice(-2);
        }

        var dateString = this.getFullYear() + "-" +
            pad(this.getMonth() + 1, 2) + '-' +
            pad(this.getDate(), 2);

        return dateString;
    };
    return date.simpleDateString()
}

//returns the full date string for url request for a particular date given a date object in unix or normal date object format
function dateString(baseDate) {
    var date = new Date(baseDate);
    Date.prototype.simpleDateString = function () {
        function pad(value) {
            return ("0" + value).slice(-2);
        }

        var dateString = this.getFullYear() + "-" +
            pad(this.getMonth() + 1, 2) + '-' +
            pad(this.getDate(), 2);

        return dateString;
    };
    // Date format required by forecast.io API.
    // We always represent a date with a time of midday,
    // so our choice of day isn't susceptible to time zone errors.
    Date.prototype.forecastDateString = function () {
        return this.simpleDateString() + "T12:00:00";
    };
    return date.forecastDateString()
}

//Constant Variables
//Defined as constants because we don't want these values to change
// /// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/const ////

// Prefix to use for Local Storage.  You may change this.
const APP_PREFIX = "weatherApp";
//// Location Cache Key
const LocationPrefix = "weatherAppLC";
////Weather Url plus key
const WeatherUrl = "https://api.forecast.io/forecast/99ca34309a8c7c576cbd835b9a0f5a0b/";

//// LocationWeatherCache class
function LocationWeatherCache() {
    // Private attributes:
    var locations = [];
    var callbacks = {};
    // Public methods:

    // Returns the number of locations stored in the cache.
    this.length = function () {
        return locations.length;
    };
    // Returns the location object for a given index.
    // Indexes begin at zero.
    //
    this.locationAtIndex = function (index) {
        return locations[index];
    };

    // Given a latitude, longitude and nickname, this method saves a 
    // new location into the cache.  It will have an empty 'forecasts'
    // property.  Returns the index of the added location.
    //
    this.addLocation = function (latitude, longitude, nickname) {
        var LocationDetails = {
            "Nickname": nickname,
            "Latitude": latitude,
            "Longitude": longitude,
            "Forecasts": {}
        };
        if (indexForLocation(LocationDetails.Latitude, LocationDetails.Longitude) == -1) {
            locations.push(LocationDetails);
            saveLocations()
            location.href = 'index.html'
        }
        else {
            var updateDecision = confirm("This location already exists - would you like to update the Nickname?");
            if (updateDecision) {
                locations[indexForLocation(LocationDetails.Latitude, LocationDetails.Longitude)].Nickname = nickname;
                saveLocations();
                location.href = 'index.html'
            }
        }
    };

    // Removes the saved location at the given index.
    // 
    this.removeLocationAtIndex = function (index) {
        locations.splice(index, 1);
    };

    // This method is used by JSON.stringify() to serialise this class.
    // Note that the callbacks attribute is only meaningful while there 
    // are active web service requests and so doesn't need to be saved.
    //
    this.toJSON = function () {
        return JSON.stringify(locations);
    };

    // Given a public-data-only version of the class (such as from
    // local storage), this method will initialise the current
    // instance to match that version.
    //
    this.initialiseFromPDO = function (locationWeatherCachePDO) {

        for (var index = 0; index < locationWeatherCachePDO.length; index++) {
            locations.push(locationWeatherCachePDO[index]);
        }
    };

    // Request weather for the location at the given index for the
    // specified date.  'date' should be JavaScript Date instance.
    //
    // This method doesn't return anything, but rather calls the 
    // callback function when the weather object is available. This
    // might be immediately or after some indeterminate amount of time.
    // The callback function should have two parameters.  The first
    // will be the index of the location and the second will be the 
    // weather object for that location.
    // 
    this.getWeatherAtIndexForDate = function (index, date, callback) {
        var propertyName, requestData;
        if (index == -1) {
            requestData = JSON.parse(localStorage.getItem(APP_PREFIX + "currentLocation"));
            propertyName = requestData.Latitude + "," + requestData.Longitude + "," + date;
            callbacks[propertyName] = callback;
            localStorage.setItem("currentWeatherCallback", propertyName);
            urlTimeRequest(WeatherUrl, requestData, date);
        }
        else {
            propertyName = locations[index].Latitude + "," + locations[index].Longitude + "," + date;
            if (locations[index].Forecasts.hasOwnProperty(propertyName)) {
                callback(index, locations[index].Forecasts[propertyName]);
            }
            else {
                requestData = {
                    "Latitude": locations[index].Latitude,
                    "Longitude": locations[index].Longitude
                };
                callbacks[propertyName] = callback;
                localStorage.setItem("currentWeatherCallback", propertyName);
                urlTimeRequest(WeatherUrl, requestData, date);
            }
        }

    };

    // This is a callback function passed to forecast.io API calls.
    // This will be called via JSONP when the API call is loaded.
    //
    // This should invoke the recorded callback function for that
    // weather request.
    //
    this.weatherResponse = function (response) {
        var latitude = response.latitude;
        var longitude = response.longitude;
        var propertyName = localStorage.getItem("currentWeatherCallback");
        if (indexForLocation(latitude, longitude) == -1) {
            callbacks[propertyName](indexForLocation(latitude, longitude), response.daily.data[0]);
        }
        else {
            locations[indexForLocation(latitude, longitude)]["Forecasts"][propertyName] = response.daily.data[0];
            callbacks[propertyName](indexForLocation(latitude, longitude), response.daily.data[0]);
            saveLocations();
        }
    };

    // Private methods:

    // Given a latitude and longitude, this method looks through all
    // the stored locations and returns the index of the location with
    // matching latitude and longitude if one exists, otherwise it
    // returns -1.
    //
    function indexForLocation(latitude, longitude) {
        var Listindex = -1;
        for (var count = 0; count < locations.length; count++) {
            if (locations[count].Latitude == latitude && locations[count].Longitude == longitude) {
                Listindex = count;
                return Listindex;
            }
        }
        return Listindex;
    }
}
//// Global functions
//#SKel
// Restore the singleton locationWeatherCache from Local Storage.
//
function loadLocations() {
    var publicDataLocations = localStorage.getItem(LocationPrefix);
    publicDataLocations = JSON.parse(publicDataLocations);
    WeatherCache.initialiseFromPDO(publicDataLocations)
}
// Save the singleton locationWeatherCache to Local Storage.
//
function saveLocations() {
    localStorage.setItem(LocationPrefix, WeatherCache.toJSON());
}
//Checks if local storage is supported
function localStorageSupport() {
    if (typeof(Storage) !== "undefined") {
        return true;
    }
    return false;
}

//Check for a locationweathercache in the local storage
function checkForLocal() {
    if (localStorage.getItem(LocationPrefix)) {
        return true;
    }
    return false;
}
//// WeatherResponce app used to respond when data is received from the server
WeatherResponse = function (WeatherData) {
    WeatherCache.weatherResponse(WeatherData);
};
////Accepts a Url a request data object with longitude and Latitude and a specific time.
////makes the url with search query and adds a script element running the callback function
function urlTimeRequest(Url, requestData, time) {
    //Adding longitude and latitude and the spiecified time into request
    var requestUrl = Url + requestData["Latitude"] + "," + requestData["Longitude"];
    requestUrl += "," + time;
    //Making up the query string
    var requestParameters = "?";
    //Adding units as si
    requestParameters += encodeURIComponent("units") + "=" + encodeURIComponent("si") + "&";
    //excluding hourly, minutely and flag elements
    requestParameters += encodeURIComponent("exclude") + "=" + encodeURIComponent("minutely") + "," + encodeURIComponent("hourly") + "," + encodeURIComponent("flags") + "&";
    //Specifying the callback function
    requestParameters += encodeURIComponent("callback") + "=" + encodeURIComponent("WeatherResponse");
    var finalRequest = requestUrl + requestParameters;
    //Creating the script element for the url
    //console.log(Final Request - finalRequest)
    var script = document.createElement('script');
    script.src = finalRequest;
    document.body.appendChild(script);
}

////initialisation code
////Check local storage support & local stored locations if true loads them
if (localStorageSupport()) {
    if (checkForLocal()) {
        loadLocations();
    }
}
else {
    alert("Full app capabilities restricted - Local storage is supported by your device")
}
