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

app.factory('tweet', ['$http', function($http) {
  var o = {
    tweet: {}
  };

  o.getTweet = function(tweetId) {
    return $http.get('/getTweet/'+ tweetId).success(function(data){
      o.tweet = data;
    });
  };

  return o;

}]);

app.controller('MapCtrl', [
  '$scope',
  'markers',
  'tweet',
  'globalSelection',
  function($scope, markers, tweet, globalSelection){

    $scope.products = globalSelection;
    $scope.markers = markers;
    $scope.tweet = tweet;

    $scope.infoVisible = false;
    $scope.infoTitle = "Text of the tweet";
    $scope.infoText = "Initial text.";

    $scope.hideInfo = function (){
      $scope.infoVisible = false;
    };

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

    });

    var createCircles = function() {
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

      var circleOpacity = 0.5;
      var circleRadius = 25000;

      function createSentimentCircles(circs) {
        function redOrGreen(x) {
          if (x < 0) { return 'red' } else {return 'green'}
        }
        function opacity() {
          //if (x < 0) { return x*(-0.1) } else {return x*0.1}
          return circleOpacity;
        }

        for (var i=0; i<circs.length; i++){
          var circleOptions = {
            map: null,
            strokeWeight: 0,
            fillColor: redOrGreen(circs[i].sentiment),
            fillOpacity: opacity(),
            center: new google.maps.LatLng(circs[i].latitude,circs[i].longitude),
            radius: circleRadius,
            clickable: true,
            tweetId: circs[i].tweetId
          };
          
          sentimentCircles.push(new google.maps.Circle(circleOptions));
        };
      };

      function createDemandCircles(circs) {
        function getColor(index) {
           return 'blue';
        }
        function opacity() {
          return circleOpacity;
        }

        for (var i=0; i<circs.length; i++){
          var circleOptions = {
            map: null,
            strokeWeight: 0,
            fillColor: getColor(i),
            fillOpacity: opacity(),
            center: new google.maps.LatLng(circs[i].latitude,circs[i].longitude),
            radius: circleRadius,
            clickable: true,
            tweetId: circs[i].tweetId
          };

          demandCircles.push(new google.maps.Circle(circleOptions));
        };
      };
      if (currentProduct!= undefined) {
        createDemandCircles(currentProduct.demand);
        createSentimentCircles(currentProduct.sentiment);
      };
    };

    var currentCircles = [];

    var getData = function() {
      if ($scope.products.currentTopicClass!= "" && $scope.products.isCurrentView('#/map')) {
        $scope.markers.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
      }
    };

    function removeCircles() {
      for (var i = 0; i<currentCircles.length; i++) {
        google.maps.event.clearListeners(currentCircles[i], 'click');
        currentCircles[i].setMap(null);
      };
      currentCircles = [];
    };

    function selectCircles(){
      if ($scope.products.showDemand) {
        currentCircles = demandCircles;
      } else {
        currentCircles = sentimentCircles;
      };
    };

    function showCircles() {
      for (var i = 0; i<currentCircles.length; i++) {
        currentCircles[i].setMap(theMap);
        google.maps.event.addListener(currentCircles[i], 'click', function(){
          $scope.tweet.getTweet(this.tweetId);
          $scope.infoVisible = true;
        });
      };

    };

    $scope.$watch('products.showDemand', function(){
      removeCircles();
      selectCircles();
      showCircles();
    });


    $scope.$watch('products.currentOptionIndex', function(){
      removeCircles();
      createCircles();
      selectCircles();
      showCircles();
    });

    $scope.$watch('products.slider.newValue', getData);

    $scope.$watch('products.currentTopicClass', getData);

    $scope.$watch('markers', function() {
      removeCircles();
      createCircles();
      selectCircles();
      showCircles();
    }, true);

    $scope.$watch('tweet.tweet', function(){
      if($scope.tweet.tweet.text!=undefined){
        $scope.infoText = $scope.tweet.tweet.text;
      }
    }, true);


  }
]);