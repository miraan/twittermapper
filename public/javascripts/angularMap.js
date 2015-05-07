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

  o.getAll = function(topic, day) {
    return $http.get('/getLocations/'+ topic + '/' + day).success(function(data){
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

    $scope.$on('mapInitialized', function(evt, map) {
      theMap = map;
      map.set('streetViewControl', false);
      map.set('mapTypeControl', false);
      map.set('minZoom', 3);  //minimum is 0;
      map.set('maxZoom', 12); //maximum is 21;

      var initialise = function() {
      console.log("initialise called");
      var product = $scope.products.currentTopicOptions[$scope.products.currentOptionIndex];
      var index = 0;
        for (var i = 0; i<$scope.markers.markers.length; i++) {
          if ($scope.markers.markers[i].product == product) {
            index = i;
          }
        };
      var currentProduct = $scope.markers.markers[index];
      demandCircles = [];
      sentimentCircles = [];

      function createSentimentCircles(circs) {
        function redOrGreen(x) {
          if (x < 0) { return 'red' } else {return 'green'}
        }
        function opacity() {
          //if (x < 0) { return x*(-0.1) } else {return x*0.1}
          return 0.5;
        }

        for (var i=0; i<circs.length; i++){
          var circleOptions = {
            map: null,
            strokeWeight: 0,
            fillColor: redOrGreen(circs[i].scale),
            fillOpacity: opacity(),
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
        function opacity() {
          return 0.5;
        }

        for (var i=0; i<circs.length; i++){
          var circleOptions = {
            map: null,
            strokeWeight: 0,
            fillColor: getColor(i),
            fillOpacity: opacity(),
            center: new google.maps.LatLng(circs[i].latitude,circs[i].longitude),
            radius: 50000
          };

          demandCircles.push(new google.maps.Circle(circleOptions));
        };
      };
      if (currentProduct!= undefined) {
        console.log("circles created");
        createDemandCircles(currentProduct.demand);
        createSentimentCircles(currentProduct.sentiment);
        console.log(demandCircles);
      }
    };
      
      function showCircles(show, hide) {
      console.log("showCircles called");
      for (var i = 0; i<hide.length; i++) {
        hide[i].setMap(null);
      };
      for (var i = 0; i<show.length; i++) {
        show[i].setMap(theMap);
      };
    };

    function removeCircles(circs) {
      for (var i = 0; i<circs.length; i++) {
        circs[i].setMap(null);
      };
    };

    function switchDemandSentiment(){
      console.log("switchDemandSentiment called");
      if ($scope.products.showDemand) {
        showCircles(demandCircles, sentimentCircles);
      } else {
        showCircles(sentimentCircles, demandCircles);
      };
    };

    function requestData(){
      if ($scope.products.currentTopicClass!= "") {
        $scope.markers.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
      }
    };

    
    $scope.$watch('products.showDemand', switchDemandSentiment);


    $scope.$watch('products.showDemand', switchDemandSentiment);

    $scope.$watch('products.currentOptionIndex', function(){
      initialise();
      switchDemandSentiment();
    });

    var getData = function() {
      if ($scope.products.currentTopicClass!= "") {
        $scope.markers.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
      }
    };

      $scope.$watch('products.slider.newValue', getData);

      $scope.$watch('products.currentTopicClass', getData);

      $scope.$watch('markers', function() {
        console.log($scope.markers);
        initialise();
        switchDemandSentiment();
        console.log(demandCircles);
      }, true);
    });



  }
]);