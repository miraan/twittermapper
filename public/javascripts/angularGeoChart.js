app.directive('geochart', function() {
  return {
    restrict: 'A',
    link: function($scope, elm, attrs) {
      $scope.$watch('products.showDemand', function() {
        var geochart = new google.visualization.GeoChart(elm[0]);
 
        if ($scope.products.showDemand) {
          console.log("Geo demand.");
          $scope.geochart.data = google.visualization.arrayToDataTable($scope.graphData.geoDemand);
          $scope.geochart.options = $scope.geochart.sentimentOptions
        } else {
          $scope.geochart.data = google.visualization.arrayToDataTable($scope.graphData.geoSentiment);
          $scope.geochart.options = $scope.geochart.demandOptions
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

    $scope.geochart = {
      sentimentOptions: {
        colorAxis: {colors: ['red','blue','green']},
        backgroundColor: '#81d4fa',
        datalessRegionColor: 'white',
        defaultColor: '#f5f5f5',
      },
      demandOptions: {
        colorAxis: {colors: ['red','yellow','green']},
        backgroundColor: '#81d4fa',
        datalessRegionColor: 'white',
        defaultColor: '#f5f5f5',
      },
    }
  }
]);