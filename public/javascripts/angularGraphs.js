app.factory('graphData', ['$http', function($http) {
  console.log("Called factory.");
  var o = {
    graphData: []
  };

  o.getAll = function() {
    return $http.get('/getGraphData.json').success(function(data){
      console.log("Success.");
      angular.copy(data, o.graphData);
    });
  };

  return o;

}]);

app.directive('timeline', function() {
  return {
    restrict: 'A',
    link: function($scope, elm, attrs) {
      $scope.$watch('timeline.line', function() {
        var timeline = '';
 
        if ($scope.timeline.line == '1') {
          timeline = new google.visualization.LineChart(elm[0]);
        } else {
          timeline = new google.visualization.BarChart(elm[0]);
        }
 
        timeline.draw($scope.timeline.data, $scope.timeline.options);
      },true);
    }
  };
});

app.controller('GraphsCtrl', [
  '$scope',
  'graphData',
  function($scope,graphData){
    $scope.graphData = graphData.graphData;
    console.log($scope.graphData);

    var header = $scope.graphData[0];
    var timelineData = [];
    for (var i = 0; i < header.demand.length; i++) {
      timelineData.push([header.demand[i]]);
    };
    console.log(timelineData);
    for (var i = 1; i < $scope.graphData.length; i++) {
      for (var j = 0; j < header.demand.length; j++) {
        timelineData[j].push($scope.graphData[i].demand[j]);
      };
    };
    

    var options = {
      curveType: 'function',
      legend: { position: 'bottom' }
    };
    var timeline = {
      line: 1
    };
 
    timeline.data = google.visualization.arrayToDataTable(timelineData);
    timeline.options = options;
    $scope.timeline = timeline;
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


