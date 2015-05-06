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

app.controller('GeoChartCtrl', [
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