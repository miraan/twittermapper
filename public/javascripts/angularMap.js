
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
    return $http.get('/getMarkersSample.json').success(function(data){
      angular.copy(data, o.markers);
    });
  };

  return o;

}]);

app.controller('MapCtrl', [
  '$scope',
  '$http',
  'markers',
  function($scope, $http, markers){

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

    $scope.markers = markers.markers;
    //console.log($scope.markers);

    $scope.map = {
      latitude: 51.752285,
      longitude: -1.247093,
      zoom: 5,
      bounds: {}
    };

    var circles = [];
    var theMap = null;

    $scope.$on('mapInitialized', function(evt, map) {
      theMap = map;
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
          circles.push( new RichMarker({
            map: map,
            position: new google.maps.LatLng(circs[i].latitude,circs[i].longitude),
            anchor: RichMarkerPosition.MIDDLE,
            flat: true,
            content: content
          }));
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
      //drawBubbles($scope.markers);
    });
  }
]);