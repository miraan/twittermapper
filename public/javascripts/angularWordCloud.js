app.factory('cloudData', ['$http', function($http) {
  var o = {    
    loading: {
      loadingData: false
    },
    cloudData: undefined
  };

  o.getAll = function(topic, day) {
    return $http.get('/getWordCloud/' + topic + '/' + day).success(function(data){
      o.cloudData= data;
      o.loading.loadingData = false;
    });
  };

  return o;

}]);

app.directive('wordcloud', function() {
  return {
    restrict: 'A',
    link: function($scope, elm, attrs) {
      function getAngle() {
        var s = Math.random() * 3;
        if (s<1) {
          return -60;
        } else if (s<2) {
          return 0;
        } else return 60;
      };

      function getSize() {
        var s = Math.random() * 3;
        if (s<1) {
          return -60;
        } else if (s<2) {
          return 0;
        } else return 60;
      };

      var drawCloud = function() {
        $(elm[0]).empty();
        if ($scope.cloudData.cloudData != undefined) {

          var product = $scope.products.currentTopicOptions[$scope.products.currentOptionIndex];
          var index = 0;
          for (var i = 0; i<$scope.cloudData.cloudData.length; i++) {
            if ($scope.cloudData.cloudData[i].product == product) {
              index = i;
            };
          };

          var words =[];
          angular.copy($scope.cloudData.cloudData[index].words, words);

          for (var i = words.length-1; i >=0; i--) {
            words[i].size = Math.sqrt(words[i].size);
          };

          var max = Math.max.apply(Math, words.map(function(o){return o.size;}));

          for (var i = words.length-1; i >=0; i--) {
            words[i].size = Math.round((words[i].size*165)/max);
          };

          
          var width = elm[0].clientWidth;
          var height = elm[0].clientHeight;

          var fill = d3.scale.category20();

          d3.layout.cloud().size([width, height])
              .words(words)
              .padding(5)
              .rotate(function() { return ~~(getAngle()); })
              .font("Impact")
              .fontSize(function(d) { return d.size; })
              .on("end", draw)
              .start();

          function draw(words) {
            d3.select(elm[0]).append("svg")
                .attr("width", width)
                .attr("height", height)
              .append("g")
                .attr("transform", "translate("+width/2+","+height/2+")")
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
          };
        };
      };  

      $scope.$watch('products.currentOptionIndex', drawCloud);

      var getData = function() {
        $scope.cloudData.loading.loadingData = true;
        $scope.products.loading = $scope.cloudData.loading;
        if ($scope.products.currentTopicClass!="" && $scope.products.isCurrentView('#/wordcloud')) {
          $scope.cloudData.getAll($scope.products.currentTopicClass, $scope.products.slider.value);
        };
      };

      $scope.$watch('products.slider.newValue', getData);

      $scope.$watch('products.currentTopicClass', getData);

      $scope.$watch('cloudData', function() {
        drawCloud();
      }, true);
    }
  };
});

app.controller('WordCloudCtrl', [
  '$scope',
  'cloudData',
  'globalSelection',
  function($scope, cloudData, globalSelection){
    $scope.products = globalSelection;
    $scope.cloudData = cloudData;
  }
]);


