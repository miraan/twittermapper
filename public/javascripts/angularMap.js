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
      console.log(o.markers);
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

    var demandColors = [
      'blue',
      '#8A2BE2',
      '#FF00FF',
      '#FF3E96',
      '#00F5FF',
      '#00FF7F',
      '#B3EE3A',
      '#DC143C',
    ]

    var demandMarkers = [];    //type [[]]
    var sentimentMarkers = []; //type [[]]

    var theMap = null;

    $scope.$on('mapInitialized', function(evt, map) {
      theMap = map;
      map.set('streetViewControl', false);
      map.set('mapTypeControl', false);
      map.set('minZoom', 3);  //minimum is 0;
      map.set('maxZoom', 12); //maximum is 21;

    });

    var sortedMarkers = [];
    var circlesCreated = false;

    var createCircles = function() {

      var circleOpacity = 0.05;
      var circleRadius = 25000;

      function createSentimentCircles(circs) {
        function redOrGreen(x) {
          if (x < 0) { return 'red' } else {return 'green'}
        }
        function opacity() {
          //if (x < 0) { return x*(-0.1) } else {return x*0.1}
          return circleOpacity;
        }

        var sentimentCircles = [];

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
        sentimentMarkers.push(sentimentCircles);
      };

      function createDemandCircles(circs) {
        function getColor(index) {
           return demandColors[demandMarkers.length];
        }
        function opacity() {
          return circleOpacity;
        }

        var demandCircles = [];

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
        demandMarkers.push(demandCircles);
      };
      
      if ($scope.products.currentTopicClass != "") {
        circlesCreated = false;
        demandMarkers = [];
        sentimentMarkers = [];
        for (var i=0; i<sortedMarkers.length; i++) {
          createDemandCircles(sortedMarkers[i].demand);
          createSentimentCircles(sortedMarkers[i].sentiment);
        };
        circlesCreated = true;
      };
      console.log(demandMarkers);
      console.log(sentimentMarkers);
      console.log("Circles created.")
    };

    var currentCircles = []; //Storing all circles currently drawn on the map type [[]]

    function find(product){
      var i=0;
      var found = false;
      while(!found && i<$scope.markers.markers.length){
        if ($scope.markers.markers[i].product==product) {
          found = true;
        } else {
          i++;
        };
      };
      if (found){
        return $scope.markers.markers[i];
      } else return undefined;
    };

    var getData = function() {
      if ($scope.products.currentTopicClass!= "" && $scope.products.isCurrentView('#/map')) {
        $scope.markers.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
      };
    };

    //Remove all circles from the map.
    function removeCircles() {
      console.log(currentCircles.length);
      console.log(currentCircles);
      for (var i = 0; i<currentCircles.length; i++) {
        for (var j=0; j<currentCircles[i].length; j++) {
          google.maps.event.clearListeners(currentCircles[i][j], 'click');
          currentCircles[i][j].setMap(null);
        }
      };
      currentCircles = [];
    };

    //Put cirles for the selected option to the currentCircles array.
    function putDemandCircles() {
      for (var i=0; i< $scope.products.currentProducts.length; i++) {
        if ($scope.products.currentProducts[i]) {
          console.log('demandMarkers[i]');
          console.log(demandMarkers);
          console.log(demandMarkers[i]);
          currentCircles.push(demandMarkers[i]);
        };
      };
      console.log("Put demand markers.");
    };

    //Put cirles for the selected option to the currentCircles array.
    function putSentimentCircles() {
      for (var i=0; i< $scope.products.currentProducts.length; i++) {
        if ($scope.products.currentProducts[i]) {
          currentCircles.push(sentimentMarkers[i]);
        };
      };
    };

    function selectCircles(){
      if ($scope.products.showDemand) {
        putDemandCircles();
      } else {
        putSentimentCircles();
      };
    };

    function showCircles() {
      console.log(currentCircles.length);
      console.log(currentCircles);
      for (var i = 0; i<currentCircles.length; i++) {
        for (var j=0; j<currentCircles[i].length; j++ ) {
          currentCircles[i][j].setMap(theMap);
          google.maps.event.addListener(currentCircles[i][j], 'click', function(){
            $scope.tweet.getTweet(this.tweetId);
          });
        }
      };
    };

    $scope.$watch('products.showDemand', function(){
      if (circlesCreated){
        removeCircles();
        selectCircles();
        showCircles();
      };
    });

    $scope.$watch('products.currentProducts', function(){
      if (circlesCreated){
        removeCircles();
        selectCircles();
        showCircles();
      };
    }, true);

    $scope.$watch('products.slider.newValue', getData);

    $scope.$watch('products.currentTopicClass', getData);

    $scope.$watch('markers', function() {
      var sortedData = [];
      for (var i=0; i<$scope.products.currentTopicOptions.length; i++) {
        console.log("Looking for: "+$scope.products.currentTopicOptions[i]);
        sortedData.push(find($scope.products.currentTopicOptions[i]));
      };
      //there is a problem!!!
      console.log("sortedData");
      console.log(sortedData);
      sortedMarkers = sortedData;
      removeCircles();
      createCircles();
      console.log("After creation and before selection.");
      console.log(demandMarkers);
      selectCircles();
      showCircles();
    }, true);

    $scope.$watch('tweet.tweet', function(){
      if($scope.tweet.tweet.text!=undefined){
        $scope.infoText = $scope.tweet.tweet.text;
        $scope.infoVisible = true;
      }
    }, true);


  }
]);