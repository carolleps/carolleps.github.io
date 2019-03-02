var map,
    defaultIcon = 'img/icon-default.png',
    hoverIcon = 'img/icon-hover.png',
    markers = [];


// ViewModel
function initMap(){
  var sydney = {lat: -33.8688729, lng: 151.2025101};
  map = new google.maps.Map(document.getElementById("map"), {
      center: sydney,
      zoom: 11
  });

  var model = [
    {
      name:"Bah BQ Brazilian Grill",
      location: {lat: -33.82405207385705, lng: 151.201379540971},
      lat: "-33.82405207385705",
      lng: "151.201379540971",
      placeid: "4e562ce2d164a0684c5ad03a",
      type: ["food"]
    },
    {
      name:"Cafecito",
      location: {lat: -33.87388778270155, lng: 151.20540911285022},
      lat: "-33.87388778270155",
      lng: "151.20540911285022",
      placeid: "4b74c8a0f964a520dbf12de3",
      type: ["food"]
    },
    {
      name:"Hair by Marcia Bento",
      location: {lat: -33.95293965661399, lng: 151.1367838450086},
      lat: "-33.95293965661399",
      lng: "151.1367838450086",
      placeid: "5656ba8d498ef1ac55b4a618",
      type: ["hair", "nails", "eyebrow"]
    },

    {
      name:"NNC Pro Beauty",
      location: {lat: -33.877589, lng: 151.216761},
      lat: "-33.877589",
      lng: "151.216761",
      placeid: "56821297498eb126410047f8",
      type: ["hair", "nails", "eyebrow"]
    },
    {
      name:"Ovo Cafe",
      location: {lat: -33.878679, lng: 151.213620},
      lat: "-33.878679",
      lng: "151.213620",
      placeid: "51d63b93498ee198deb6ba5d",
      type: ["food"]
    },
  ];

  var bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow();

  function hideMarkers(){
    for(var i = 0; i < markers.length; i++){
      markers[i].setMap(null);
    }
  } 

  for(var i = 0; i< model.length; i++){
    var location = model[i].location; //latlng Maps API
    var lat = model[i].lat; //lat Foursquare API
    var lng = model[i].lng; //lng Foursquare API
    var name = model[i].name;
    var category = model[i].type;
    var placeid = model[i].placeid; // FourSquare API id

    // creates marker with info from google api and model
    var marker = new google.maps.Marker({
      map: map,
      position: location,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      title: name,
      placeid: placeid,
      lat: lat,
      lng: lng,
      category: category
    });

    markers.push(marker);

    marker.addListener('mouseover', function() {
        this.setIcon(hoverIcon);
    });

    marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });

    addFourSquareApi(marker);

    
  }

  // Adding FourSquare Api info to a marker          
  function addFourSquareApi(marker){
    var CLIENT_ID = "CELRLYF4G3HUCWR13FCSDQWBFFRMMQB4N4AG2V1CLE1033RA";
    var CLIENT_SECRET = "HZI32FORJWCCUAEB5ZBDKHURVHVLVGDEDUJ1AKX21BYMB20Q";
    $.ajax({
      // url: 'https://api.foursquare.com/v2/venues/' + marker.placeid + '?client_id=CELRLYF4G3HUCWR13FCSDQWBFFRMMQB4N4AG2V1CLE1033RA&client_secret=HZI32FORJWCCUAEB5ZBDKHURVHVLVGDEDUJ1AKX21BYMB20Q'
      url:'https://api.foursquare.com/v2/venues/' + marker.placeid,
      dataType: 'json',
      data: 'limit=1' +
      //     '&ll=' + marker.lat + ',' + marker.lng +
      //     '&query=' + marker.placeid +
          '&client_id='+ CLIENT_ID +
          '&client_secret='+ CLIENT_SECRET +
          '&v=20161206',

      async: true,
      success: function(data){
        console.log('success');
        // check if venue exists before create properties
        if (data.response.hasOwnProperty('venue')){
          var result = data.response.venue;
          marker.photo = result.hasOwnProperty('bestPhoto')? result.bestPhoto.prefix + '200x200' + result.bestPhoto.suffix: 'img/sorry.jpg';
          if (result.likes.hasOwnProperty('summary')){
            marker.likes = result.likes.summary
          }
          else{
            marker.likes = "no likes so far"
          }
          marker.rating = result.hasOwnProperty('rating')? result.rating +'/10': 'no rating so far'; 
          marker.url = result.hasOwnProperty('url')? result.url: '';
          // console.log(marker);

          if (result.hasOwnProperty('contact')) {
            marker.phone = result.contact.hasOwnProperty('formattedPhone')? result.contact.formattedPhone: 'not provided'; 
          }

          if (result.location.hasOwnProperty('formattedAddress')){
            marker.address =[];
            for(var i = 0; i < result.location.formattedAddress.length; i++){
              marker.address = marker.address + result.location.formattedAddress.shift() + '';
            }
          }
          console.log(marker);
        }

        marker.content = '<h3>' + marker.title + '</h3>'+
        '<div><p><strong>Address: </strong>' + marker.address + '</p>' +
        '<p><strong>Phone: </strong>' + marker.phone + '</p>' +
        '<p><strong>Website: </strong><a target="_blank" href="' + marker.url + '">'+ marker.url + '</a></p>'+
        '<p><strong>Services: </strong>' + marker.category + '</p>' +
        '<p><strong>Rating: </strong>' + marker.rating + ' - ' + marker.likes + '</p>' + 
        '<img id="infowindow-image" src=' + marker.photo + ' /></div>'
        
        marker.addListener('click', function(){
            populateInfoWindow(this, infoWindow);
        });
        
        // fill the selected infowindow with data from APIs
        function populateInfoWindow(marker, infowindow){
          // Check to make sure the infowindow is not already opened on this marker.
          if (infowindow.marker != marker) {
            infowindow.setContent(marker.content);          
            marker.setIcon(hoverIcon);
            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
              infowindow.marker = null;
              marker.setIcon(defaultIcon);
            });
            infowindow.open(map, marker);
          }
        }
      },
      error: function(error){
        var errorInfowindow = new google.maps.InfoWindow();
        errorInfowindow.marker = marker;
        errorInfowindow.setContent("<div><p>Sorry something went wrong..</p></div>");
        errorInfowindow.open(map, marker);
        console.log(marker);
      }
    });
  }

  // knockout binding
  ko.applyBindings(new ViewModel());
}

// google maps error
function googleError() {
"use strict";
  showMapMessage(true);
}


var ViewModel = function(){
  var self = this;
  self.list = ko.observableArray(markers);

  self.showListings = function(){
    showListings();
  };

  self.hideListings = function(){
    hideListings();
  };
  
  self.query = ko.observable('');
  
  self.search = ko.computed(function(){
    return ko.utils.arrayFilter(self.list(), function(marker){
      // Check if location matches query
      var match =  marker.title.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
      // Simultaneously update markers on the map
      marker.setVisible(match);
      return match;
    });
  });

  self.selectPlace = function(marker) {
    google.maps.event.trigger(marker, 'click');
    self.hideSidebar();
  }

  //function for changing sidebar
  self.visibleSidebar = ko.observable(false);

  self.hideSidebar = function() {
    self.visibleSidebar(false);
    return true;
  }

  self.openSidebar = function () {
    var oppositeSidebarState = !(self.visibleSidebar());
    self.visibleSidebar(oppositeSidebarState);
    return true;
  }

  //foursquare and google error ko - by default false
  self.showMessage = ko.observable(false);
  self.showMapMessage = ko.observable(false);

  self.showListings = function(){
    showListings();
  }
  
  self.hideListings = function(){
    hideListings();
  }
}

  // // fill the selected infowindow with data from APIs
  // function populateInfoWindow(marker, infowindow){
  //   // Check to make sure the infowindow is not already opened on this marker.
  //   if (infowindow.marker != marker) {
  //     infowindow.setContent(
  //       '<h3>' + marker.title + '</h3>'+
  //       '<div><p><strong>Address: </strong>' + marker.address + '</p>' +
  //       '<p><strong>Phone: </strong>' + marker.phone + '</p>' +
  //       '<p><strong>Website: </strong><a target="_blank" href="' + marker.url + '">'+ marker.url + '</a></p>'+
  //       '<p><strong>Services: </strong>' + marker.category + '</p>' +
  //       '<p><strong>Rating: </strong>' + marker.rating + ' - ' + marker.likes + '</p>' + 
  //       '<img id="infowindow-image" src=' + marker.photo + ' /></div>'
  //       );          
  //     marker.setIcon(hoverIcon);
  //     infowindow.marker = marker;
  //     // Make sure the marker property is cleared if the infowindow is closed.
  //     infowindow.addListener('closeclick', function() {
  //       infowindow.marker = null;
  //       marker.setIcon(defaultIcon);
  //     });
  //     infowindow.open(map, marker);
  //   }
  // }
  self.zoom = function(){
    zoomToArea();
  };


  //when the button to show markers is clicked
  function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

  // This function will loop through the listings and hide them all.
  function hideListings() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  } 

  function googleMapErrorHandler(){
    alert('Google map did not load correctly. Please try it again');
  }

// takes the input value in the find nearby area text input
// locates it, and then zooms into that area. This is so that the user can
// show all listings, then decide to focus on one area of the map.
function zoomToArea() {
  // Initialize the geocoder.
  var geocoder = new google.maps.Geocoder();
  // Get the address or place that the user entered.
  var address = document.getElementById('zoom-to-area-text').value;
  // Make sure the address isn't blank.
  if (address == '') {
    window.alert('You must enter an area, or address.');
  } else {
    // Geocode the address/area entered to get the center. Then, center the map
    // on it and zoom in
    geocoder.geocode(
      { 
        componentRestrictions: {country: 'AU',
      postalCode: address}
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(15);
        } else {
          window.alert('We could not find that location - try entering a more' +
              ' specific place.');
        }
      });
  }
}
