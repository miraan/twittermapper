app.directive('draggable', function(){
  return {
    restrict: 'A',
    link : function(scope,elem,attr){
      $(elem).draggable();
    }
  }  
});

app.directive('resizable', function(){   
  return {
    restrict: 'A',
    link : function(scope,elem,attr){
      $(elem).resizable();
    }
  }  
});

app.factory('markers', ['$http', function($http) {
  var o = {
    markers: []
  };

  o.getAll = function() {
    return $http.get('/getLocations.json').success(function(data){
      angular.copy(data, o.markers);
    });
  };

  return o;

}]);

app.controller('MapCtrl', [
  '$scope',
  'markers',
  'globalSelection',
  function($scope, markers, globalSelection){

    $scope.products = globalSelection;
    $scope.markers = markers;

/*
    $scope.infoVisible = false;
    $scope.infoTitle = "";
    $scope.infoText = "Initial text.";

    $scope.showInfo = function (index){
      $scope.infoTitle = $scope.markers[index].item;
      $scope.infoText = "Clicked on the marker with id:"+$scope.markers[index].id;

      $scope.infoVisible = true;
      $scope.$apply();
    };
    $scope.hideInfo = function (){
      $scope.infoText = "";
      $scope.infoVisible = false;
    };*/

    $scope.map = {
      latitude: 51.752285,
      longitude: -1.247093,
      zoom: 5,
      bounds: {}
    };

    var demandCircles = [];
    var sentimentCircles = [];
    var theMap = null;

    var draw = function() {
      $scope.markers.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
      var currentProduct = $scope.markers.markers[$scope.currentOptionIndex];

      function createSentimentCircles(circs) {
        function redOrGreen(x) {
          if (x < 0) { return 'red' } else {return 'green'}
        }
        function opacity(x) {
          if (x < 0) { return x*(-0.1) } else {return x*0.1}
        }

        for (var i=0; i<circs.length; i++){
          var circleOptions = {
            map: null,
            strokeWeight: 0,
            fillColor: redOrGreen(circs[i].scale),
            fillOpacity: opacity(circs[i].scale),
            center: new google.maps.LatLng(circs[i].latitude,circs[i].longitude),
            radius: 50000
          };
          
          sentimentCircles.push(new google.maps.Circle(circleOptions));
        };
      };

      function createDemandCircles(circs) {
        function getColor(index) {
           return 'blue';
        }
        function opacity(x) {
          return x*0.003;
        }

        for (var i=0; i<circs.length; i++){
          var circleOptions = {
            map: null,
            strokeWeight: 0,
            fillColor: getColor(i),
            fillOpacity: opacity(circs[i].value),
            center: new google.maps.LatLng(circs[i].latitude,circs[i].longitude),
            radius: 50000
          };

          demandCircles.push(new google.maps.Circle(circleOptions));
        };

      createDemandCircles(currentProduct.demand);
      createSentimentCircles(currentProduct.sentiment);

    };

    $scope.$on('mapInitialized', function(evt, map) {
      theMap = map;
      map.set('streetViewControl', false);
      map.set('mapTypeControl', false);
      map.set('minZoom', 3);  //minimum is 0;
      map.set('maxZoom', 12); //maximum is 21;
    });

    function showCircles(show, hide) {
      for (var i = 0; i<hide.length; i++) {
        hide[i].setMap(null);
      };
      for (var i = 0; i<show.length; i++) {
        show[i].setMap(theMap);
      };
    };

    function switchDemandSentiment(){
      if ($scope.products.showDemand) {
        showCircles(demandCircles, sentimentCircles);
      } else {
        showCircles(sentimentCircles, demandCircles);
      };
    }

    
    $scope.$watch('products.showDemand', switchDemandSentiment,true);

  }
]);