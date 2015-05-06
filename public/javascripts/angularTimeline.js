app.factory('graphData', ['$http', function($http) {
  var o = {
    graphData: []
  };

  o.getAll = function(topic, day) {
    return $http.get('/getGraph.json').success(function(data){
      angular.copy(data, o.graphData);
    });
  };

  return o;

}]);

app.directive('timeline', function() {
  return {
    restrict: 'A',
    link: function($scope, elm, attrs) {
      var timeline = new google.visualization.LineChart(elm[0]);
      var drawChart = function() {
        if ($scope.products.showDemand) {
          $scope.timelineData = $scope.demandData[$scope.products.currentOptionIndex];
        } else {
          $scope.timelineData = $scope.sentimentData[$scope.products.currentOptionIndex];
        }
        if($scope.timelineData!= undefined) {
          timeline.draw($scope.timelineData, $scope.timelineOptions);
        }  
      };

      $scope.$watch('products.showDemand', drawChart);

      $scope.$watch('products.currentOptionIndex', drawChart);

      var refreshData = function(){
        $scope.graphData.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
        $scope.initialise();
      };

      var refreshAndDraw = function() {
        refreshData();
        drawChart();
      }

      $scope.$watch('products.slider.value', refreshAndDraw);

      $scope.$watch('products.currentTopicClass', refreshAndDraw);
    }
  };
});

app.controller('TimelineCtrl', [
  '$scope',
  'graphData',
  'globalSelection',
  function($scope,graphData, globalSelection){
    $scope.products = globalSelection;
    $scope.graphData = graphData;

    $scope.timelineOptions = {
      curveType: 'function',
      legend: { position: 'bottom' }
    };
    $scope.timelineData = {};
    $scope.demandData = [];
    $scope.sentimentData = [];
    $scope.initialise = function () {
      $scope.timelineData = {};
      $scope.demandData = [];
      $scope.sentimentData = [];

      for (var j = 0; j<$scope.graphData.graphData.length; j++) {
        var demandData = new google.visualization.DataTable();
        demandData.addColumn('date', 'Date');
        demandData.addColumn('number', $scope.graphData.graphData[j].product);
        for (var i = 0; i < $scope.graphData.graphData[j].demand.length; i++) {
          demandData.addRow([new Date($scope.graphData.graphData[j].demand[i][0]), $scope.graphData.graphData[j].demand[i][1]]);
        };
        $scope.demandData.push(demandData);

        var sentimentData = new google.visualization.DataTable();
        sentimentData.addColumn('date', 'Date');
        sentimentData.addColumn('number', 'iPhone');
        for (var i = 0; i < $scope.graphData.graphData[j].sentiment.length; i++) {
          sentimentData.addRow([new Date($scope.graphData.graphData[j].sentiment[i][0]), $scope.graphData.graphData[j].sentiment[i][1]]);
        };
        $scope.sentimentData.push(sentimentData);
      };
    };
  }
]);