app.factory('graphData', ['$http', function($http) {
  var o = {
    loading: {
      loadingData: false
    },
    graphData: []
  };

  o.getAll = function(topic, day) {
    return $http.get('/getGraph/' + topic + '/' + day).success(function(data){
      o.graphData= data;
      o.loading.loadingData = false;
      console.log(data);
    });
  };

  return o;

}]);

app.factory('stockData', ['$http', function($http) {
  var o = {
    loading: {
      loadingData: false
    },
    stockData: []
  };

  o.getAll = function(topic, day) {
    return $http.get('/getStock/' + topic + '/' + day).success(function(data){
      o.stockData= data;
      console.log(data);
      o.loading.loadingData = false;
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
        $scope.graphData.loading.loadingData = true;
        $scope.products.loading = $scope.graphData.loading;
        if ($scope.products.currentTopicClass!="" && $scope.products.isCurrentView('#/timeline')) {
          $scope.graphData.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
        }
      };

      var getStockData = function() {
        $scope.stockData.loading.loadingData = true;
        $scope.products.loading = $scope.stockData.loading;
        if ($scope.products.currentTopicClass!="" && $scope.products.isCurrentView('#/timeline')) {
          $scope.stockData.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
        }
      };

      $scope.$watch('products.slider.newValue', getData);

      $scope.$watch('products.currentTopicClass', getData);

      $scope.$watch('products.showStock', getStockData);

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
          //if ($scope.isCurrentView('#/timeline')) $scope.products.loadingData = false;
        };
        initialiseAndDraw();
      }, true);

      $scope.$watch('stockData', initialiseAndDraw, true);
    }
  };
});

app.controller('TimelineCtrl', [
  '$scope',
  'graphData',
  'stockData',
  'globalSelection',
  function($scope,graphData, stockData, globalSelection){
    $scope.products = globalSelection;
    $scope.graphData = graphData;
    $scope.stockData = stockData;
    $scope.sortedData = [];

    $scope.timelineOptions = {};

    $scope.timelineDemandOptions = {
      curveType: 'function',
      legend: { position: 'bottom' },
      colors:[],
      series: {},
          // Gives each series an axis name that matches the Y-axis below.
          //0: {axis: 'Temps'},
          //1: {axis: 'Daylight'}
      
      vAxes: {
          // Adds labels to each axis; they don't have to match the axis names.
          0: {logScale: false}
      }
    };

    $scope.timelineSentimentOptions = {
      curveType: 'function',
      legend: { position: 'bottom' },
      colors: [],
      series: {},
          // Gives each series an axis name that matches the Y-axis below.
          //0: {axis: 'Temps'},
          //1: {axis: 'Daylight'}
      
      axes: {
          0: {logScale: false}
      }
    };

    $scope.timelineData = {};
    $scope.dataCreated = false;
    var colors = [
      'blue',
      '#FF0000',
      'orange',
      '#00FF1E',
      '#E600FF',
      '#00FFF2',//
      '#000000',
      '#DC143C',
    ];

    var findCompany = function (name){
      var found = false;
      var i = 0;
      console.log($scope.stockData.stockData);
      while (!found && i<$scope.stockData.stockData.length) {
        if ($scope.stockData.stockData[i].company == name) {
          found = true;
        } else {
          i++;
        };
      };
      if (found) {
        return $scope.stockData.stockData[i];
      } else {
        return undefined;
      };
    };

    $scope.initialise = function () {
      if ($scope.dataCreated) {
        $scope.timelineData = {};

        var columnsIndexes = [];
        var companyNames = [];
        var companyNamesUnique = [];
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Date');

        for (var i=0; i<$scope.products.currentProducts.length; i++){
          if ($scope.products.currentProducts[i]) {
            data.addColumn('number', $scope.sortedData[i].product);
            columnsIndexes.push(i);
            if ($scope.sortedData[i].company!= undefined) companyNames.push($scope.sortedData[i].company);
          };
        };

        if ($scope.products.showStock) {
          var stockMin = 10000;
          var stockMax = 0;
          for (var i=0; i<$scope.stockData.stockData.length; i++) {
            var max = Math.max.apply(Math, 
              $scope.stockData.stockData[i].stock.map(function(o){return o[1];}));
            stockMax = Math.max(stockMax, max);
            var min = Math.min.apply(Math, 
              $scope.stockData.stockData[i].stock.map(function(o){return o[1];}));
            stockMin = Math.min(stockMin, min);
          }; 
          console.log(stockMin);
          console.log(stockMax);

          $scope.timelineSentimentOptions.series = {};
          $scope.timelineSentimentOptions.axes = {
            0: {title: "Sentiment", logScale: false},
            1: {title: 'Stock', logScale: false, maxValue: stockMax, minValue: stockMin}
          };
          $scope.timelineDemandOptions.series = {};
          $scope.timelineDemandOptions.axes = {
            0: {title: 'Demand', logScale: false},
            1: {title: 'Stock', logScale: false, maxValue: stockMax, minValue: stockMin}
          };

          companyNamesUnique = companyNames.filter(function(item, pos) {
            return companyNames.indexOf(item) == pos;
          });
          console.log(companyNamesUnique);

          var lineIndex = 0;

          for (var i=0; i<companyNamesUnique.length; i++) {
            var stockRow = findCompany(companyNamesUnique[i]);
            data.addColumn('number', stockRow.company+" stock");
            $scope.timelineDemandOptions.colors.push(colors[i]);
            $scope.timelineDemandOptions.series[lineIndex] = {targetAxisIndex:1};
            lineIndex++;
          }

          for (var i=0; i<companyNamesUnique.length; i++) {
            console.log(companyNamesUnique[i]);
            var stockRow = findCompany(companyNamesUnique[i]);
            console.log(stockRow);
            console.log(stockRow.stock)
            for (var j=0; j<stockRow.stock.length; j++) {
              var row = [new Date(stockRow.stock[j][0])]
              console.log(row[0]);
              for (var k=0; k<columnsIndexes.length; k++){
                row.push(null);
              };
              for (var k=0; k<i; k++){
                row.push(null);
              };
              row.push(stockRow.stock[j][1])
              for (var k=i+1; k<companyNamesUnique.length; k++){
                row.push(null);
              };
              console.log(row.length);
              data.addRow(row);
            };
          };

        } else {
          $scope.timelineSentimentOptions.series = {};
          $scope.timelineSentimentOptions.axes = {
            0: {title: "Sentiment", logScale: false}
          };
          $scope.timelineDemandOptions.series = {};
          $scope.timelineDemandOptions.axes = {
            0: {title: 'Demand', logScale: false, minValue: 0}
          };
        };

        if ($scope.products.showDemand){
          $scope.timelineDemandOptions.colors = [];
          $scope.timelineOptions = $scope.timelineDemandOptions;

          for (var i=0; i<columnsIndexes.length; i++){
            var index = columnsIndexes[i];
            $scope.timelineDemandOptions.colors.push(colors[index]);
            $scope.timelineDemandOptions.series[lineIndex] = {targetAxisIndex:0};
            lineIndex++;
            for (var j=0; j<$scope.sortedData[index].demand.length; j++){
              var row = [new Date($scope.sortedData[index].demand[j][0])]

              for (var k=0; k<i; k++){
                row.push(null);
              };
              row.push($scope.sortedData[index].demand[j][1])
              for (var k=i+1; k<columnsIndexes.length; k++){
                row.push(null);
              };

              for (var k=0; k<companyNamesUnique.length; k++){
                row.push(null);
              };
              data.addRow(row);
            };
          };
        } else {
          $scope.timelineSentimentOptions.colors = [];
          $scope.timelineOptions = $scope.timelineSentimentOptions;

          for (var i=0; i<columnsIndexes.length; i++){
            var index = columnsIndexes[i];
            $scope.timelineSentimentOptions.colors.push(colors[index]);
            $scope.timelineDemandOptions.series[lineIndex] = {targetAxisIndex:0};
            lineIndex++;
            for (var j=0; j<$scope.sortedData[index].sentiment.length; j++){
              var row = [new Date($scope.sortedData[index].sentiment[j][0])]
              for (var k=0; k<companyNamesUnique.length; k++){
                row.push(null);
              };
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