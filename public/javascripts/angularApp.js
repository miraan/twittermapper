var app = angular.module('oxTwi', ['ui.router','uiGmapgoogle-maps']);

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
      controller: 'MapCtrl'
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

app.factory('markers', [function(){
  var o = {
    markers: []
  };
  return o;
}]);

app.controller('MapCtrl', [
  '$scope',
  function($scope){
    $scope.showChart = false;

    $scope.map = {
      center: {
        latitude: 40.1451,
        longitude: -99.6680
      },
      zoom: 4,
      bounds: {}
    };

    $scope.options = {
      scrollwheel: false
    };

    var createRandomMarker = function(i, bounds, idKey) {
      var lat_min = bounds.southwest.latitude,
        lat_range = bounds.northeast.latitude - lat_min,
        lng_min = bounds.southwest.longitude,
        lng_range = bounds.northeast.longitude - lng_min;

      if (idKey == null) {
        idKey = "id";
      }

      var latitude = lat_min + (Math.random() * lat_range);
      var longitude = lng_min + (Math.random() * lng_range);
      var ret = {
        latitude: latitude,
        longitude: longitude,
        title: 'm' + i
      };
      ret[idKey] = i;
      return ret;
    };
    $scope.randomMarkers = [];
    // Get the bounds from the map once it's loaded
    $scope.$watch(function() {
      return $scope.map.bounds;
    }, function(nv, ov) {
      // Only need to regenerate once
      if (!ov.southwest && nv.southwest) {
        var markers = [];
        for (var i = 0; i < 50; i++) {
          markers.push(createRandomMarker(i, $scope.map.bounds))
        }
        $scope.randomMarkers = markers;
      }
    }, true);
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

