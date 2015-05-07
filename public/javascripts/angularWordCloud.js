app.factory('cloudData', ['$http', function($http) {
  var o = {
    cloudData: undefined
  };

  o.getAll = function(topic, day) {
    return $http.get('/getWordCloud/' + topic + '/' + day).success(function(data){
      o.cloudData= data;
    });
  };

  return o;

}]);

app.directive('wordcloud', function() {
  return {
    restrict: 'A',
    link: function($scope, elm, attrs) {

      var drawCloud = function() {
        console.log($scope.cloudData.cloudData);
        if ($scope.cloudData.cloudData != undefined) {
          console.log($scope.cloudData.cloudData[0].words);

        var product = $scope.products.currentTopicOptions[$scope.products.currentOptionIndex];
        var index = 0;
        for (var i = 0; i<$scope.cloudData.cloudData.length; i++) {
          if ($scope.cloudData.cloudData[i].product == product) {
            index = i;
          }
        };

          var fill = d3.scale.category20();

          var words =[];
          angular.copy($scope.cloudData.cloudData[index].words, words);
          console.log(words.length);
          for (var i = words.length-1; i >=0; i--) {
            words[i].size = Math.round(Math.sqrt(words[i].size)/3);
            console.log("{ text: '"+words[i].text+"', size: "+words[i].size+" },");
          };
          
          var width = elm[0].clientWidth;
          var height = elm[0].clientHeight;
          console.log(width);
          console.log(height);
          console.log(elm[0]);

          var fill = d3.scale.category20b();

          var w = width,
                  h = height;

          var max,
                  fontSize;

          var layout = d3.layout.cloud()
                  .timeInterval(Infinity)
                  .size([w, h])
                  .fontSize(function(d) {
                      return fontSize(+d.size);
                  })
                  .text(function(d) {
                      return d.text;
                  })
                  .on("end", draw);

          var svg = d3.select(elm[0]).append("svg")
                  .attr("width", w)
                  .attr("height", h);

          var vis = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

          update();

          function draw(data, bounds) {
              var w = width,
                  h = height;

              svg.attr("width", w).attr("height", h);

              scale = bounds ? Math.min(
                      w / Math.abs(bounds[1].x - w / 2),
                      w / Math.abs(bounds[0].x - w / 2),
                      h / Math.abs(bounds[1].y - h / 2),
                      h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;

              var text = vis.selectAll("text")
                      .data(data, function(d) {
                          return d.text.toLowerCase();
                      });
              text.transition()
                      .duration(1000)
                      .attr("transform", function(d) {
                          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                      })
                      .style("font-size", function(d) {
                          return d.size + "px";
                      });
              text.enter().append("text")
                      .attr("text-anchor", "middle")
                      .attr("transform", function(d) {
                          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                      })
                      .style("font-size", function(d) {
                          return d.size + "px";
                      })
                      .style("opacity", 1e-6)
                      .transition()
                      .duration(1000)
                      .style("opacity", 1);
              text.style("font-family", function(d) {
                  return d.font;
              })
                      .style("fill", function(d) {
                          return fill(d.text.toLowerCase());
                      })
                      .text(function(d) {
                          return d.text;
                      });

              vis.transition().attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
          }

          function update() {
              layout.font('impact').spiral('archimedean');
              fontSize = d3.scale['sqrt']().range([10, 100]);
              if (words.length){
                  fontSize.domain([+words[words.length - 1].size || 1, +words[0].size]);
              }
              layout.stop().words(words).start();
          }

        };
      };

      //$scope.$watch('products.currentOptionIndex', drawCloud);

      var getData = function() {
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


