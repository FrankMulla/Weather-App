

// This is sample code to demonstrate navigation.
// You need not use it for final app.
var loadingBarRef = document.getElementById("loadingBar");

///////////////// Styling and display bases from http://www.w3schools.com/jsref/prop_style_visibility.asp //////////////////////////
showLoading();
//Function to ensure the loading bar is started
function showLoading() {
    loadingBarRef.style.display = 'block';
}
//Function to stop the loading bar
function hideLoading() {
    loadingBarRef.style.display = 'none';
}
//Function that stores the selected location index in local storage and launches the view location page
function viewLocation(locationName) {
    // Save the desired location to local storage
    localStorage.setItem(APP_PREFIX + "-selectedLocation", locationName);
    // And load the view location page.
    location.href = 'viewlocation.html';
}
//function to remove all locations from local storage and refresh the list page.
function resetApp(){
    var deleteDecision = confirm("Are you sure you want to reset?");
    if (deleteDecision) {
        localStorage.removeItem(LocationPrefix);
        location.href = 'index.html'
    }
}

// function that takes the list index and the weather object for the page and loads min and max temperatures and icons
//passed as callback to location weather cache methods
addToListHTML = function(listIndex, weatherObject) {
    var nickName = WeatherCache.locationAtIndex(listIndex).Nickname;
    var image = "images/" + weatherObject.icon + ".png";
    var summaryString = "Min: " + weatherObject.temperatureMin + "&#8451, Max: " + weatherObject.temperatureMax + "&#8451";
    var listElement ="<li class=\"mdl-list__item mdl-list__item--two-line\" onclick=\"viewLocation("+ listIndex +")\">";
    listElement += "<span class=\"mdl-list__item-primary-content\">";
    listElement += "<img class=\"mdl-list__item-icon\" id=\"icon"+listIndex+"\" src=\"" + image + "\" class=\"list-avatar\" />";
    listElement += "<span>"+nickName+"</span>";
    listElement += "<span id=\"weather" + listIndex + "\" class=\"mdl-list__item-sub-title\">"+ summaryString +"</span>";
    listElement +="</span>";
    listElement +="</li>";
    document.getElementById("locationList").innerHTML += (listElement);
};

loadLocationInformation();
//function that loads all locations passing the addtoListHtml as a callback and hides the loading when done
function loadLocationInformation() {
    var length = WeatherCache.length();
    if (length != 0) {
        for (var i = 0; i < length; i++) {
            WeatherCache.getWeatherAtIndexForDate(i, FormatDate(), addToListHTML);
        }
    }
    hideLoading();
}

   
