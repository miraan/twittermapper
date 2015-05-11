app.factory('graphData', ['$http', function($http) {
  var o = {
    graphData: []
  };

  o.getAll = function(topic, day) {
    return $http.get('/getGraph/' + topic + '/' + day).success(function(data){
      o.graphData= data;
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
        if($scope.dataCreated && ($scope.timelineData.getNumberOfColumns())>1) {
          timeline.draw($scope.timelineData, $scope.timelineOptions);
        }  
      };

      function initialiseAndDraw() {
        $scope.initialise();
        drawChart();
      };

      $scope.$watch('products.showDemand', initialiseAndDraw);

      $scope.$watch('products.currentProducts', initialiseAndDraw, true);

      var getData = function() {
        $scope.products.loadingData = true;
        if ($scope.products.currentTopicClass!="" && $scope.products.isCurrentView('#/timeline')) {
          $scope.graphData.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
        }
      };

      $scope.$watch('products.slider.newValue', getData);

      $scope.$watch('products.currentTopicClass', getData);

      function find(product){
        var i=0;
        var found = false;
        while(!found && i<$scope.graphData.graphData.length){
          if ($scope.graphData.graphData[i].product==product) {
            found = true;
          } else {
            i++;
          };
        };
        if (found){
          return $scope.graphData.graphData[i];
        } else return undefined;
      };

      $scope.$watch('graphData', function() {
        $scope.dataCreated = false;
        var sortedData = [];
        for (var i=0; i<$scope.products.currentTopicOptions.length; i++) {
          sortedData.push(find($scope.products.currentTopicOptions[i]));
        };
        $scope.sortedData = sortedData;
        if (sortedData.length != 0) {
          $scope.dataCreated = true;
          $scope.products.loadingData = false;
        };
        initialiseAndDraw();
      }, true);
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
    $scope.sortedData = [];

    $scope.timelineOptions = {};

    $scope.timelineDemandOptions = {
      curveType: 'function',
      legend: { position: 'bottom' }
    };

    $scope.timelineSentimentOptions = {
      curveType: 'function',
      legend: { position: 'bottom' },
      series: {
        0: { color: 'green' }
      }
    };

    $scope.timelineData = {};
    $scope.dataCreated = false;

    $scope.initialise = function () {
      if ($scope.dataCreated) {
        $scope.timelineData = {};

        var columnsIndexes = [];
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Date');

        for (var i=0; i<$scope.products.currentProducts.length; i++){
          if ($scope.products.currentProducts[i]) {
            data.addColumn('number', $scope.sortedData[i].product);
            columnsIndexes.push(i);
          };
        };

        if ($scope.products.showDemand){
          $scope.timelineOptions = $scope.timelineDemandOptions;

          for (var i=0; i<columnsIndexes.length; i++){
            var index = columnsIndexes[i];
            for (var j=0; j<$scope.sortedData[index].demand.length; j++){
              var row = [new Date($scope.sortedData[index].demand[j][0])]
              for (var k=0; k<i; k++){
                row.push(null);
              };
              row.push($scope.sortedData[index].demand[j][1])
              for (var k=i+1; k<columnsIndexes.length; k++){
                row.push(null);
              };
              data.addRow(row);
            };
          };
        } else {
          $scope.timelineOptions = $scope.timelineSentimentOptions;

          for (var i=0; i<columnsIndexes.length; i++){
            var index = columnsIndexes[i];
            for (var j=0; j<$scope.sortedData[index].sentiment.length; j++){
              var row = [new Date($scope.sortedData[index].sentiment[j][0])]
              for (var k=0; k<i; k++){
                row.push(null);
              };
              row.push($scope.sortedData[index].sentiment[j][1])
              for (var k=i+1; k<columnsIndexes.length; k++){
                row.push(null);
              };
              data.addRow(row);
            };
          };
        };
        $scope.timelineData = data;
      }
    };
  }
]);