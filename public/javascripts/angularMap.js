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
    loading: {
      loadingData: false
    },
    markers: []
  };

  o.getAll = function(topic, day) {
    return $http.get('/getLocations/'+ topic + '/' + day).success(function(data){
      angular.copy(data, o.markers);
      o.loading.loadingData = false;
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
    $scope.infoTitle = "Tweet Text";
    $scope.infoText = "Initial text.";

    $scope.hideInfo = function (){
      $scope.infoVisible = false;
    };

    $scope.map = {
      latitude: 46.7641588,
      longitude: -47.0000449,
      zoom: 4,
      bounds: {}
    };

    var demandColors = [
      'blue',
      '#FF0000',
      '#FFFB00',
      '#00FF1E',
      '#E600FF',
      '#00FFF2',//
      '#FFFFFF',
      '#FF9100',
    ];

    var opacity = [
      0.55,   //Zoomed out
      0.5,
      0.45,
      0.4,
      0.35,
      0.3,
      0.25,
      0.2,
      0.15,
      0.07  //Zoomed in
    ];

    var circleRadius = 25000;

    var demandMarkers = [];    //type [[]]
    var sentimentMarkers = []; //type [[]]

    var theMap = null;

    $scope.$on('mapInitialized', function(evt, map) {
      theMap = map;
      map.set('streetViewControl', false);
      map.set('mapTypeControl', false);
      map.set('minZoom', 3);  //minimum is 0;
      map.set('maxZoom', 12); //maximum is 21;

      google.maps.event.addListener(theMap, 'zoom_changed', function() {
        for (var i=0; i<currentCircles.length; i++){
          for (var j=0; j<currentCircles[i].length; j++){
            currentCircles[i][j].set('fillOpacity', opacity[theMap.getZoom()-3]);
          };
        };
      });

      var sortedMarkers = [];
      var circlesRemoved = false;
      var circlesCreated = false;
      var circlesSelected = false;
      var circlesShowed = false;

      var createCircles = function() {

        function createSentimentCircles(circs) {
          function redOrGreen(x) {
            if (x < 0) { return 'red' } else {return 'green'}
          }
          function getOpacity() {
            //if (x < 0) { return x*(-0.1) } else {return x*0.1}
            return opacity[theMap.getZoom()-3];
          }

          var sentimentCircles = [];

          for (var i=0; i<circs.length; i++){
            var circleOptions = {
              map: null,
              strokeWeight: 0,
              fillColor: redOrGreen(circs[i].sentiment),
              fillOpacity: getOpacity(),
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
          function getOpacity() {
            return opacity[theMap.getZoom()-3];
          }

          var demandCircles = [];

          for (var i=0; i<circs.length; i++){
            var circleOptions = {
              map: null,
              strokeWeight: 0,
              fillColor: getColor(i),
              fillOpacity: getOpacity(),
              center: new google.maps.LatLng(circs[i].latitude,circs[i].longitude),
              radius: circleRadius,
              clickable: true,
              tweetId: circs[i].tweetId
            };

            demandCircles.push(new google.maps.Circle(circleOptions));
          };
          demandMarkers.push(demandCircles);
        };
        
        if (($scope.products.currentTopicClass != "") && !($scope.markers.loading.loadingData)) {
          circlesCreated = false;
          demandMarkers = [];
          sentimentMarkers = [];
          for (var i=0; i<sortedMarkers.length; i++) {
            createDemandCircles(sortedMarkers[i].demand);
            createSentimentCircles(sortedMarkers[i].sentiment);
          };
          currentCircles = [];
          circlesCreated = true;
        };
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
        $scope.markers.loading.loadingData = true;
        $scope.products.loading = $scope.markers.loading;
        if ($scope.products.currentTopicClass!= "" && $scope.products.isCurrentView('#/map')) {
          $scope.markers.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
        };
      };

      //Remove all circles from the map.
      function removeCircles() {
        if (circlesCreated){
          for (var i = 0; i<currentCircles.length; i++) {
            for (var j=0; j<currentCircles[i].length; j++) {
              google.maps.event.clearListeners(currentCircles[i][j], 'click');
              currentCircles[i][j].setMap(null);
            }
          };
          currentCircles = [];
        };
      };

      //Put cirles for the selected option to the currentCircles array.
      function putDemandCircles() {
        $scope.products.legend.colorNames = [];
        for (var i=0; i< $scope.products.currentProducts.length; i++) {
          if ($scope.products.currentProducts[i]) {
            $scope.products.legend.colorNames.push({
              color: demandColors[i],
              name: $scope.products.currentTopicOptions[i]
            });
            currentCircles.push(demandMarkers[i]);
          };
        };
      };

      //Put cirles for the selected option to the currentCircles array.
      function putSentimentCircles() {
        $scope.products.legend.colorNames = [];
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
        if (!($scope.markers.loading.loadingData)){
          for (var i = 0; i<currentCircles.length; i++) {
            for (var j=0; j<currentCircles[i].length; j++ ) {
              currentCircles[i][j].setMap(theMap);
              google.maps.event.addListener(currentCircles[i][j], 'click', function(){
                $scope.tweet.getTweet(this.tweetId);
                $scope.infoVisible = true;
              });
            }
          };
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
          sortedData.push(find($scope.products.currentTopicOptions[i]));
        };
        sortedMarkers = sortedData;
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

      if ($scope.products.currentTopicClass!= "") {
        getData();
      }

    });
  }
]);