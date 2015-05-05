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
      $scope.$watch('timeline.line', function() {
        var timeline = '';

        timeline = new google.visualization.LineChart(elm[0]);
 /*
        if ($scope.timeline.line == '1') {
          $scope.timeline.data = google.visualization.arrayToDataTable($scope.graphData.demand);
          timeline = new google.visualization.LineChart(elm[0]);
        } else {
          $scope.timeline.data = google.visualization.arrayToDataTable($scope.graphData.sentiment);
          timeline = new google.visualization.LineChart(elm[0]);
        }*/
 
        timeline.draw($scope.timeline.data, $scope.timeline.options);
      },true);
    }
  };
});

app.directive('geochart', function() {
  return {
    restrict: 'A',
    link: function($scope, elm, attrs) {
      $scope.$watch('geochart.line', function() {
        var geochart = '';
 
        if ($scope.geochart.line == '1') {
          $scope.geochart.data = google.visualization.arrayToDataTable($scope.graphData.geoDemand);
          geochart = new google.visualization.GeoChart(elm[0]);
        } else {
          $scope.geochart.data = google.visualization.arrayToDataTable($scope.graphData.geoSentiment);
          geochart = new google.visualization.GeoChart(elm[0]);
        }
 
        geochart.draw($scope.geochart.data, $scope.geochart.options);
      },true);
    }
  };
});

app.directive('wordcloud', function() {
  return {
    restrict: 'A',
    link: function($scope, elm, attrs) {
      console.log($scope.graphData.wordCloud);
      var fill = d3.scale.category20();

      d3.layout.cloud().size([300, 300])
          .words($scope.graphData.wordCloud)
          .padding(5)
          .rotate(function() { return ~~(Math.random() * 2) * 90; })
          .font("Impact")
          .fontSize(function(d) { return d.size; })
          .on("end", draw)
          .start();

      function draw(words) {
        d3.select(elm[0]).append("svg")
            .attr("width", 300)
            .attr("height", 300)
          .append("g")
            .attr("transform", "translate(150,150)")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
      }
    }
  };
});

app.controller('GraphsCtrl', [
  '$scope',
  'graphData',
  'products',
  function($scope,graphData, products){
    $scope.products = products;
    $scope.graphData = graphData.graphData;
/*
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
    };*/
    

    var timelineOptions = {
      curveType: 'function',
      legend: { position: 'bottom' }
    };
    var timeline = {
      data: [],
      line: 1
    };
 
    //timeline.data = google.visualization.arrayToDataTable(timelineData);
    timeline.options = timelineOptions;

    var data = new google.visualization.DataTable();
    data.addColumn('date', 'Date');
    data.addColumn('number', 'iPhone');

    for (var i = 0; i < $scope.graphData.demand.length; i++) {
      data.addRow([new Date($scope.graphData.demand[i][0]), $scope.graphData.demand[i][1]]);
    };
    timeline.data = data;


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


