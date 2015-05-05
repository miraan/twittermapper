google.load('visualization', '1', {packages:['corechart']});
 
google.setOnLoadCallback(function () {
  angular.bootstrap(document.body, ['oxTwi']);
});

var app = angular.module('oxTwi', ['ui.router','ngMap','ui.bootstrap']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('map', {
      url: '/map',
      templateUrl: 'Views/map.html',
      controller: 'MapCtrl',
      resolve: {
        markerPromise: ['markers', function(markers) {
          return markers.getAll();
        }]
      }
    })
    .state('graphs', {
      url: '/graphs/{id}',
      templateUrl: 'Views/graphs.html',
      controller: 'GraphsCtrl',
      resolve: {
        markerPromise: ['graphData', function(graphData) {
          return graphData.getAll();
        }]
      }
    });

  $urlRouterProvider.otherwise('map');
}]);

app.factory('markers', ['$http', function($http) {
  var o = {
    markers: []
  };

  o.getAll = function() {
    return $http.get('/getMarkersSample.json').success(function(data){
      angular.copy(data, o.markers);
    });
  };

  return o;

}]);

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

app.controller('MenuCtrl', [
  '$scope',
  function($scope){
    $scope.menu = {
      map: {
        state: 'active',
      },
      graphs: {
        state: '',
      }
    };

    $scope.active = $scope.menu.map;
    $scope.setActive = function(active){
      $scope.active.state = "";
      active.state = 'active';
      $scope.active = active;
    };
  }
]);

app.controller('MapCtrl', [
  '$scope',
  '$http',
  'markers',
  function($scope, $http, markers){
    $scope.topics = [
      "Apps and Games",
      "Books",
      "Cars and Motorbikes",
      "Computers and Accessories",
      "Watches"
    ];
    $scope.topicsOptions = [
      ["Entire Market","Temple Run","Cut the Rope","iFitness","Tripr"], // Apps and Games
      [], // Books
      [], // Cars and Motorbikes
      [], // Computers and Accessories
      []  // Watches
    ]


    $scope.infoVisible = false;
    $scope.infoTitle = "";
    $scope.infoText = "Initial text.";

    $scope.circles = [];
    $http.get('/getSentimentsSample.json')
      .then(function(res){
        $scope.circles = res.data;
    });

    $scope.showInfo = function (index){
      $scope.infoTitle = $scope.markers[index].item;
      $scope.infoText = "Clicked on the marker with id:"+$scope.markers[index].id;

      $scope.infoVisible = true;
      $scope.$apply();
    };
    $scope.hideInfo = function (){
      $scope.infoText = "";
      $scope.infoVisible = false;
    };

    $scope.selecTopic = function(topicI){ // I is for index
      $scope.optIndex = 0;
      $scope.brighten = true;
      $scope.topiClass = $scope.topics[topicI];
      $scope.topic = $scope.topics[topicI];
      $scope.topicOptions = $scope.topicsOptions[topicI];
      $scope.hideAll();
    };
    $scope.selectOption = function(optionI){
      $scope.optIndex = optionI;
      if (optionI == 0) { $scope.topic = $scope.topiClass; }
      else { $scope.topic = $scope.topicOptions[optionI]; }
      $scope.hideAll();
    };
    $scope.hideAll = function(){
      $scope.optionsHidden = true;
      $scope.optionsViewIsT = false;
    };
    $scope.showOptions = function(){
      $scope.optionsHidden = false;
    };
    $scope.toggleTopiClasses = function(){
      $scope.optionsViewIsT = !$scope.optionsViewIsT;
    };
    $scope.isTopiClass = function(t){
      return t != $scope.topiClass;
    }


    $scope.markers = markers.markers;
    //console.log($scope.markers);

    $scope.map = {
      latitude: 51.752285,
      longitude: -1.247093,
      zoom: 5,
      bounds: {}
    };

    $scope.$on('mapInitialized', function(evt, map) {
      map.set('streetViewControl', false);

      function drawCircles(circs) {
        function redOrGreen(x) {
          if (x < 0) { return 'red' } else {return 'green'}
        }
        function opacity(x) {
          if (x < 0) { return x*(-0.1) } else {return x*0.1}
        }

        for (var i=0; i<circs.length; i++) {
          var content = '<div class="aCircle"'+
                            ' style="background:'+redOrGreen(circs[i].scale)+';'+
                                   ' opacity:'+opacity(circs[i].scale)+';">'+
                        '</div>';
          var circle = new RichMarker({
            map: map,
            position: new google.maps.LatLng(circs[i].latitude,circs[i].longitude),
            anchor: RichMarkerPosition.MIDDLE,
            flat: true,
            content: content
          });
        };
      }

      function drawBubbles(bubs) {
        for (var i=0; i<bubs.length; i++) {
          var content = '<div class= "marker-arrow-size'+bubs[i].scale+'"></div>'+
                        '<img class= "circle-marker marker-size'+bubs[i].scale+'" src="'+bubs[i].imageUrl+'"/>'
          var marker = new RichMarker({
            map: map,   // !! $scope.map
            index: i,    //change for id
            position: new google.maps.LatLng(bubs[i].latitude,bubs[i].longitude),
            flat: true,
            anchor: RichMarkerPosition.MIDDLE,
            content: content
          });
          google.maps.event.addListener(marker, 'click', function() {
            $scope.showInfo(this.index);
          });
        };
      }

      drawCircles($scope.circles);
      drawBubbles($scope.markers);
    });
  }
]);