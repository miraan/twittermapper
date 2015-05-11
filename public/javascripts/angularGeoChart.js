app.factory('geoData', ['$http', function($http) {
  var o = {
    graphData: []
  };

  o.getAll = function(topic, day) {
    return $http.get('/getGeoChart/' + topic + '/' + day).success(function(data){
      o.graphData= data;
      console.log(data);
    });
  };

  return o;

}]);

app.directive('geochart', function() {
  return {
    restrict: 'A',
    link: function($scope, elm, attrs) {
      var geochart = new google.visualization.GeoChart(elm[0]);
      var drawChart = function() {
        var product = $scope.products.currentTopicOptions[$scope.products.currentOptionIndex];
        var index = 0;
        for (var i = 0; i<$scope.graphData.graphData.length; i++) {
          if ($scope.graphData.graphData[i].product == product) {
            index = i;
          }
        };
        if ($scope.products.showDemand) {
          $scope.geochartData = $scope.demandData[index];
          $scope.geochartOptions = $scope.geochartDemandOptions
        } else {
          $scope.geochartData = $scope.sentimentData[index];
          $scope.geochartOptions = $scope.geochartSentimentOptions
        }
        if($scope.geochartData!= undefined) {
          geochart.draw($scope.geochartData, $scope.geochartOptions);
        }  
      };

      $scope.$watch('products.showDemand', drawChart);

      $scope.$watch('products.currentOptionIndex', drawChart);

      var refreshData = function(){
        if($scope.products.currentTopicClass!= ""){
          $scope.graphData.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
          $scope.initialise();    
        }
      };

      var getData = function() {
        if ($scope.products.currentTopicClass!="" && $scope.products.isCurrentView('#/geochart')) {
          $scope.graphData.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
        }
      };

      $scope.$watch('products.slider.newValue', getData);

      $scope.$watch('products.currentTopicClass', getData);

      $scope.$watch('graphData', function() {
        $scope.initialise();
        drawChart();
      }, true);
    }
  };
});

app.controller('GeoChartCtrl', [
  '$scope',
  'geoData',
  'globalSelection',
  function($scope, geoData, globalSelection){
    $scope.products = globalSelection;
    $scope.graphData = geoData;

    $scope.geochartSentimentOptions = {
        colorAxis: {colors: ['red','yellow','green']},
        backgroundColor: '#002147',
        datalessRegionColor: 'white',
        defaultColor: '#f5f5f5',
    };
    $scope.geochartDemandOptions = {
        colorAxis: {colors: ['#A8D8F0','#290AC4']},
        backgroundColor: '#002147',
        datalessRegionColor: 'white',
        defaultColor: '#f5f5f5',
    };
    $scope.geochartOptions = {};

    $scope.geochartData = {};
    $scope.demandData = [];
    $scope.sentimentData = [];
    $scope.initialise = function () {
      $scope.geochartData = {};
      $scope.demandData = [];
      $scope.sentimentData = [];

      for (var j = 0; j<$scope.graphData.graphData.length; j++) {
        var demandData = [['Country', 'Demand']];

        for (var i = 0; i < $scope.graphData.graphData[j].demand.length; i++) {
          demandData.push($scope.graphData.graphData[j].demand[i]);
        };

        $scope.demandData.push(
          google.visualization.arrayToDataTable(demandData)
        );

        var sentimentData = [['Country', 'Sentiment']];

        for (var i = 0; i < $scope.graphData.graphData[j].sentiment.length; i++) {
          sentimentData.push($scope.graphData.graphData[j].sentiment[i]);
        };

        $scope.sentimentData.push(
          google.visualization.arrayToDataTable(sentimentData)
        );

      };
    };
  }
]);