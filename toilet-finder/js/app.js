var map,
    defaultIcon = 'img/icon-default.png',
    hoverIcon = 'img/icon-hover.png',
    wheelchairIcon = 'img/icon-wheelchair.png',
    wheelchairhoverIcon = 'img/icon-wheelchairhover.png'
    markers = [];


// ViewModel
function initMap(){
  var sydney = {lat: -33.8688729, lng: 151.2025101};
  map = new google.maps.Map(document.getElementById("map"), {
      center: sydney,
      zoom: 11
  });

  

  var bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow();

  function hideMarkers(){
    for(var i = 0; i < markers.length; i++){
      markers[i].setMap(null);
    }
  } 

  for(var i = 0; i< model.length; i++){
    var lat = model[i].LATITUDE.toString(); //lat Foursquare API
    var lng = model[i].LONGITUDE.toString(); //lng Foursquare API
    var location = {lat: model[i].LATITUDE, lng: model[i].LONGITUDE}; //latlng Maps API
    var name = model[i].LOCATION_NAME;
    var category = model[i].TRANSPORT_MODE;
    var placeid = model[i].EFA_ID.toString(); // FourSquare API id
    var allfacilities = model[i].FACILITIES;
    var allaccessibility = model[i].ACCESSIBILITY;

    //facilities one by one
    var facility = {accessToilet: false}
    facility_list = model[i].FACILITIES.split(' | ');
    for (var f = 0; f < facility_list.length; f++) {
      var entry = facility_list[f].toLowerCase();

      if (entry.includes("wheelchair accessible toilet")) {
        facility.accessToilet = true;
      }
    }

    //accessibilities one by one
    var accessibility = {accessToilet: false, paSystem: false, hearingLoop: false, levelCrossing: false, stairs: false, tactileSurfaces: false, carPark: false}

    access_list = model[i].ACCESSIBILITY.split(' | ');

    for (var j = 0; j < access_list.length; j++) {
      var entry = access_list[j].toLowerCase();

      if (entry.includes("wheelchair")) {
        console.log("Got one");
        accessibility.wheelchair = true;
      } else {
        // console.log("Could not understand accessibility string " + entry);
      }
      


    }

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
      category: category,
      allaccessibility: allaccessibility,
      accessibility: accessibility,
      facility: facility,
      allfacilities: allfacilities
    });
    
    markers.push(marker);

    for (var i = 0; i < markers.length; i++) {
      if (markers[i].facility.accessToilet == true){
        markers[i].setIcon(wheelchairIcon);
      } 
      else {
        markers[i].setIcon(defaultIcon);
      }
    }


    marker.addListener('mouseover', function() {
        this.setOpacity(50);
        // if (marker.icon == defaultIcon) {
        //   this.setIcon(hoverIcon);
        // }
        // else {
        //   this.setIcon(wheelchairhoverIcon);
        // }
    });

    marker.addListener('mouseout', function() {
        this.setOpacity(100);
        // if (marker.icon == defaultIcon) {
        //   this.setIcon(defaultIcon);
        // }
        // else {
        //   this.setIcon(wheelchairIcon);
        // }
    });

    marker.content = '<h3>' + marker.title + '</h3>'+
    '<div><p><strong>Services: </strong>' + marker.category + '</p>' +
    '<p><strong>Facilities: </strong>' + marker.allfacilities + '</p>' + 
    '<p><strong>Accessibility: </strong>' + marker.allaccessibility + '</p>'

    marker.addListener('click', function(){
        populateInfoWindow(this, infoWindow);
    });

    // fill the selected infowindow with data from APIs
    function populateInfoWindow(marker, infowindow){
      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker != marker) {
        infowindow.setContent(marker.content);          
        // marker.setIcon(hoverIcon);
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
          infowindow.marker = null;
          // marker.setIcon(defaultIcon);
        });
        infowindow.open(map, marker);
      }
    }
 
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

  self.showToiletsonlyListings = function(){
    showToiletsonlyListings();
  }
  
  self.query = ko.observable('');
  
 

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

  
  self.zoom = function(){
    zoomToArea();
  };


  //when the button to show markers is clicked
  function showListings() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setVisible(true);
     } 
    
    // var bounds = new google.maps.LatLngBounds();
    // // Extend the boundaries of the map for each marker and display the marker
    // for (var i = 0; i < markers.length; i++) {
    //   markers[i].setMap(map);
    //   bounds.extend(markers[i].position);
    // }
    // // map.fitBounds(bounds);
    map.zoom(11);
    // map.center: sydney
  }

  // This function will loop through the listings and hide them all.
  function hideListings() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setVisible(false);
    } 
    // for (var i = 0; i < markers.length; i++) {
    //   markers[i].setMap(null);
    // }
  } 

  function googleMapErrorHandler(){
    alert('Google map did not load correctly. Please try it again');
  }

function showToiletsonlyListings() {
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].facility.accessToilet == false){
        markers[i].setVisible(false);
      } 
      else {
        markers[i].setVisible(true);
        markers[i].setIcon(wheelchairIcon);
      }
    }
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
      route: address}
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(16);
        } else {
          window.alert('We could not find that location - try entering a more' +
              ' specific place.');
        }
      });
  }
}


    