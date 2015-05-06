app.factory('graphData', ['$http', function($http) {
  var o = {
    graphData: []
  };

  o.getAll = function() {
    return $http.get('/getGraphData.json').success(function(data){
      angular.copy(data, o.graphData);
    });
  };

  return o;

}]);

app.directive('timeline', function() {
  return {
    restrict: 'A',
    link: function($scope, elm, attrs) {
      $scope.$watch('products.showDemand', function() {
        var timeline = '';

        timeline = new google.visualization.LineChart(elm[0]);

        if ($scope.products.showDemand) {
          $scope.timeline.data = $scope.demandData;
        } else {
          $scope.timeline.data = $scope.sentimentData;
        }
 
        timeline.draw($scope.timeline.data, $scope.timeline.options);
      },true);
    }
  };
});

app.controller('TimelineCtrl', [
  '$scope',
  'graphData',
  'globalSelection',
  function($scope,graphData, globalSelection){
    $scope.products = globalSelection;
    $scope.graphData = graphData.graphData;

    var timelineOptions = {
      curveType: 'function',
      legend: { position: 'bottom' }
    };
    var timeline = {
      data: []
    };
 
    timeline.options = timelineOptions;

    var demandData = new google.visualization.DataTable();
    demandData.addColumn('date', 'Date');
    demandData.addColumn('number', 'iPhone');
    for (var i = 0; i < $scope.graphData.demand.length; i++) {
      demandData.addRow([new Date($scope.graphData.demand[i][0]), $scope.graphData.demand[i][1]]);
    };
    $scope.demandData = demandData;

    var sentimentData = new google.visualization.DataTable();
    sentimentData.addColumn('date', 'Date');
    sentimentData.addColumn('number', 'iPhone');
    for (var i = 0; i < $scope.graphData.sentiment.length; i++) {
      sentimentData.addRow([new Date($scope.graphData.sentiment[i][0]), $scope.graphData.sentiment[i][1]]);
    };
    $scope.sentimentData = sentimentData;

    if ($scope.products.showDemand) {
      timeline.data = demandData;
    } else {
      timeline.data = sentimentData;
    }

    $scope.timeline = timeline;

    var geochartOptions = {
      colorAxis: {colors: ['red', 'blue']},
      backgroundColor: '#81d4fa',
      datalessRegionColor: 'white',
      defaultColor: '#f5f5f5',
    };
    var geochart = {
      line: 1
    }
    geochart.options = geochartOptions;
    $scope.geochart = geochart;
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
      ['Male', 35],
      ['Female', 28]
    ]);

  options = {'title':'Male female ratio',
             'width': 0,
            'height': 0};  

  // Instantiate and draw our chart, passing in some options.
  chart = new google.visualization.PieChart(angular.element('#chart_div'));
  reDrawChart();
}


$(window).resize(reDrawChart);*/


