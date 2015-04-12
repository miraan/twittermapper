var app = angular.module('oxTwi', []);
var myLatlng = new google.maps.LatLng(51.503454,-0.119562);

function MapPoint(id, latLng, importance, title){ 
    this.id = id;
    this.latLng = latLng;
    this.importance = importance;
    this.title = title;
}

app.controller('MainCtrl', [
  '$scope',
  function($scope){
  	$scope.showChart = false;
  	$scope.count = 6;
  	$scope.test = 'Hello world!';
    $scope.markers = []; 
    $scope.mapPoints = [
      new MapPoint(1, myLatlng, 0, "New marker"),
      new MapPoint(1, myLatlng, 0, "New marker")
    ];

    $scope.addPost = function(){
      $scope.mapPoints.push(new MapPoint(1, myLatlng, 0, "New marker"));
    };

    $scope.getBounds = function(){
    	console.log(map.getBounds());
    };

    $scope.addMarker0 = function(){
      $scope.addMarker($scope.mapPoints[0])
    };

    $scope.removeMarker0 = function(){
      $scope.markers[0].setMap(null);
    };

    $scope.addMarker = function(mapPoint){
      var marker = new google.maps.Marker({
        position: mapPoint.latLng,
        title: mapPoint.title
      });
      $scope.markers.push(marker);
      marker.setMap(map);
      console.log("Marker added.");

      google.maps.event.addListener(marker, 'click', function() {
	    $scope.showChart = true;
	    console.log("Clicked on the marker."+$scope.showChart);
	  });
    };
  }
]);
