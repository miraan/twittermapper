var app = angular.module('oxTwi', ['ui.router','ngMap']);

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
    }).state('graphs', {
      url: '/graphs/{id}',
      templateUrl: 'Views/graphs.html',
      controller: 'GraphsCtrl'
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
  function($scope, markers){
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
  'markers',
  function($scope, markers){
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
    };

    $scope.markers = markers.markers;

    $scope.map = {
      latitude: 51.752285,
      longitude: -1.247093,
      zoom: 5,
      bounds: {}
    };

    $scope.options = {
      scrollwheel: false
    };

    $scope.$on('mapInitialized', function(evt, map) {
      map.set('streetViewControl', false);
      for (var i=0; i<$scope.markers.length; i++) {
        var content = '<div class= "marker-arrow-size'+$scope.markers[i].scale+'"></div>'+
                      '<img class= "circle-marker marker-size'+$scope.markers[i].scale+'" src="'+$scope.markers[i].imageUrl+'"/>'
        var marker = new RichMarker({
          map: map,   // !! $scope.map
          index: i,    //change for id
          position: new google.maps.LatLng($scope.markers[i].latitude,$scope.markers[i].longitude),
          flat: true,
          anchor: RichMarkerPosition.MIDDLE,
          content: content
        });
        google.maps.event.addListener(marker, 'click', function() {
          $scope.showInfo(this.index);
        });
      };
    });
  }
]);


app.controller('GraphsCtrl', [
  '$scope',
  '$stateParams',
  function($scope,$stateParams){
    
  }
]);

// google.maps.event.addDomListener(window, 'load', initialize);

/*
// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
var chart;
var data;
var options;
function reDrawChart() {
  // Set chart options
  options.width = angular.element('#chart_div').width;
  options.height = angular.element('#chart_div').height;
  chart.draw(data, options);
}

function drawChart() {

  // Create the data table.
  data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ['Mushrooms', 3],
      ['Onions', 1],
      ['Olives', 1],
      ['Zucchini', 1],
      ['Pepperoni', 2]
    ]);

  options = {'title':'How Much Pizza I Ate Last Night',
             'width': 0,
            'height': 0};  

  // Instantiate and draw our chart, passing in some options.
  chart = new google.visualization.PieChart(angular.element('#chart_div'));
  reDrawChart();
}


$(window).resize(reDrawChart);
*/

