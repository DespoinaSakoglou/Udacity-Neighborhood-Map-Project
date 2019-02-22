//--- Featured list of highlights
var highlights = [
    {
        "name": "Rotonda", 
        "address": "Egnatia 144, Thessaloniki 546 22, Greece", 
        "url": "https://inthessaloniki.com/item/rotonda-of-galerius/",
        "date" : 1345,
        "latLng": { 
            "lat": 40.6321,
            "lng": 22.9517,
        }
    },    
    {
        "name": "White Tower", 
        "address": "Thessaloniki 546 21, Greece", 
        "url": "https://en.wikipedia.org/wiki/White_Tower_of_Thessaloniki", 
        "date" : 1350,
        "latLng": { 
            "lat": 40.6264,
            "lng": 22.9484,
        }
    }, 
    {
        "name": "Aristotelous Square", 
        "address": "Thessaloniki 546 24, Greece", 
        "url": "https://en.wikipedia.org/wiki/Aristotelous_Square", 
        "date" : 1690,
        "latLng": { 
            "lat": 40.6323,
            "lng": 22.9408,
        }
    },
    {
        "name": "Ladadika", 
        "address": "Thessaloniki 546 25, Greece", 
        "url": "https://inthessaloniki.com/food/ladadika/", 
        "date" : 1905,
        "latLng": { 
            "lat": 40.6348,
            "lng": 22.9365,
        }
    },
        {
        "name": "Bit Bazaar", 
        "address": "Tositsa 7, Thessaloniki 546 31, Greece", 
        "url": "https://inthessaloniki.com/food/bit-bazaar/", 
        "date" : 1856,
        "latLng": { 
            "lat": 40.6389,
            "lng": 22.9443,
        }
    },
    // Add more locations here
];

clientID = "SMTDISF1ETBB4LWEVRFQAXE41ZU4BZ3TLKK43S2O1JY2UM5R";
clientSecret = "GGHRJ1YFEX0ZIV5XO20NMOFIZFSLIK5D1FAW3OMQ5L3Q1LJU";

//--- Weather API for Thessaloniki
var weatherapi = "http://api.wunderground.com/api/8b2bf4a9a6f86794/conditions/q/GR/Thessaloniki.json";
var temperature, iconurl, icon;

// Dsplay weather information in home.html
$.getJSON(weatherapi, function(data) {
    // Weather information will be displayed in <div class="forecast"> in home.html
    details = data.current_observation;
    temperature =  details.temp_c;
    iconurl = details.icon_url;
    icon = details.icon;
}).error(function(e){
    console.log("Failed to get Weather Underground information. Please check your internet connection.");
    alert("Failed to get Weather Underground information. Please check your internet connection.");
}).success(function(){
    viewModel.weather1('Temperature: ' +temperature + '°C');
    viewModel.weather2('<img src="' + iconurl + '">  ' + icon);
});

//--- Map 
// Map variables
var map, infowindow;
var markers = [];
var wikilinks = [];
// Documentation: https://developers.google.com/maps/documentation/javascript/
function initMap() {
    // Google Maps will be displayed in id="map"
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lat: 40.6401, lng: 22.9444},
        mapTypeId: 'terrain'
    });
    infowindow = new google.maps.InfoWindow();  
    // Populate markers
    for (var i = 0; i < highlights.length; i++) {  
            marker = new google.maps.Marker({
            position: {lat: highlights[i].latLng.lat, lng: highlights[i].latLng.lng},
            map: map,
            // Animate markers (optional)
            draggable: false,
            animation: google.maps.Animation.DROP
        });     
        viewModel.attractions()[i].marker = marker;
        // Click on markers
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            // API call when populating markers
            var gname = "";
            var name = highlights[i].name.replace(' ', '_');
            var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ highlights[i].latLng.lat + ',' + highlights[i].latLng.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + name;
            $.getJSON(foursquareURL).error(function(e){
                alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
            }).done(function(res) {
                gname = res.response.venues[0].name;
            });
            return function () {    
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    marker.setAnimation(null);
                }, 500); // only bounce for .5 seconds when clicked
                // Pop out info window
                infowindow.setContent('<div id="content">' + "<p><b>" + highlights[i].name + "</b></p>" + '<div id="bodyContent">'+
                                       "<p><b>Address: </b>" + highlights[i].address + "</p>" + 
                                       '<p><b>URL: \
                                       </b><a href="'+ highlights[i].url + '">' + highlights[i].name + '</a>' + '</p>' + '</div>' 
                                       + '<img src="https://maps.googleapis.com/maps/api/streetview?size=100x100&location='+ highlights[i].latLng.lat + ','+  highlights[i].latLng.lng 
                                       + '&heading=200&pitch=0&key=AIzaSyBGpbBD1bxQdNbNB3ckPFfK1s-prjJH0tM">' + '</div>'
                                       + '<p>Greek name: ' + gname + '</p>');
                infowindow.open(map, marker);                                
        }})(marker, i));     
    }
    // Search box
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (!places.length) { return;}
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place has no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

//--- Knockout ViewModel

// Attraction object
var Attraction = function(data) {
    this.name = data.name;
    this.address = data.address;
    this.url = data.url;
    this.lat = data.latLng.lat;
    this.lng = data.latLng.lng; 
    this.filtered = ko.observable(true);
    this.date = data.date;
};
var viewModel = {
    title: ko.observable("<h2><b>Welcome to Thessaloniki, Greece!</b></h2>"),
    subtitle: ko.observable("<h3 style='margin-top: -10px; margin-bottom: 20px;'>< Enjoy the experience ></h3>"),
    weather1: ko.observable(),
    weather2: ko.observable(),
    resetFunc: function() {
        map.setCenter({lat: 40.6401, lng: 22.9444});
    },
    query: ko.observable(''),
    filtered: ko.observable(true),
    list: function(place) {
        place.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            place.marker.setAnimation(null);
        }, 2000);
        // API call when populating markers
        var gname = "";
        var name = place.name.replace(' ', '_');
        var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ place.lat + ',' + place.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + name;
        $.getJSON(foursquareURL).error(function(e){
            alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
        }).done(function(res) {
            gname = res.response.venues[0].name;

            infowindow.setContent('<div id="content">' + "<p><b>" + place.name + "</b></p>" + '<div id="bodyContent">'+
                                       "<p><b>Address: </b>" + place.address + "</p>" + '<p><b>URL: </b><a href="' 
                                       + place.url + '">' + place.name + '</a>' + '</p>' + '</div>' 
                                       + '<img src="https://maps.googleapis.com/maps/api/streetview?size=150x150&location='+ place.lat + ',' +  place.lng 
                                       + '&heading=200&pitch=0&key=AIzaSyBGpbBD1bxQdNbNB3ckPFfK1s-prjJH0tM">' + '</div>'
                                       + '<p>Greek name: ' + gname +'</p>');
            infowindow.open(map, place.marker);
        });
    }
};
viewModel.attractions = ko.observableArray();
viewModel.makeHighlights = function() {
    var self = this;
    highlights.forEach(function(elem){
        self.attractions.push(new Attraction(elem));
    });
};
viewModel.search = function(value){
    viewModel.attractions().forEach(function(elem){
        elem.marker.setVisible(false);
        elem.filtered(false);
    });
    for (var x in viewModel.attractions()){
        if (viewModel.attractions()[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            viewModel.attractions()[x].filtered(true);
            viewModel.attractions()[x].marker.setVisible(true);

        } else {
            viewModel.attractions()[x].filtered(false);
            viewModel.attractions()[x].marker.setVisible(false);
        }
    }
};
viewModel.query.subscribe(viewModel.search);
viewModel.makeHighlights();
ko.applyBindings(viewModel);