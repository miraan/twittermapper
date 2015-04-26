var app = angular.module('oxTwi', ['ui.router','ngMap']);

function MapPoint(id, latLng, importance, title){ 
    this.id = id;
    this.latLng = latLng;
    this.importance = importance;
    this.title = title;
}

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
    });
/*
  $stateProvider
    .state('graphs', {
    url: '/graphs/{id}',
    templateUrl: '/graphs.html',
    controller: 'GraphsCtrl'
  });*/

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

app.controller('MapCtrl', [
  '$scope',
  'markers',
  function($scope, markers){
    $scope.showChart = false;

    $scope.markers = markers.markers;

    $scope.map = {
      latitude: 51.752285,
      longitude: -1.247093,
      zoom: 8,
      bounds: {}
    };

    $scope.options = {
      scrollwheel: false
    };

    $scope.$on('mapInitialized', function(evt, map) {
      new RichMarker({
        map: map,   // !! $scope.map
        position: new google.maps.LatLng(51.752285,-1.247093),
        flat: true,
        anchor: RichMarkerPosition.MIDDLE,
        content: '<div class= "marker-arrow-size1"></div>'+
                 '<img class= "circle-marker marker-size1" src="http://www.meganfox.com/wp-content/uploads/2014/01/3.jpg"/>'+
                  '<div class= "marker-bottom-size1"></div>'
      });  
    });
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

