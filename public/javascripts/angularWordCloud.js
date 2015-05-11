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
        $(elm[0]).empty();
        console.log($scope.cloudData.cloudData);
        if ($scope.cloudData.cloudData != undefined) {
          console.log($scope.cloudData.cloudData[0].words);

          var product = $scope.products.currentTopicOptions[$scope.products.currentOptionIndex];
          var index = 0;
          for (var i = 0; i<$scope.cloudData.cloudData.length; i++) {
            if ($scope.cloudData.cloudData[i].product == product) {
              index = i;
            };
          };

          var words =[];
          angular.copy($scope.cloudData.cloudData[index].words, words);
          console.log(words);
          for (var i = words.length-1; i >=0; i--) {
            words[i].size = Math.round(Math.sqrt(words[i].size));
            console.log("{ text: '"+words[i].text+"', size: "+words[i].size+" },");
          };
          
          var width = elm[0].clientWidth;
          var height = elm[0].clientHeight;

          var fill = d3.scale.category20();

          d3.layout.cloud().size([width, height])
              .words(words)
              .padding(5)
              .rotate(function() { return ~~(Math.random() * 2) * 90; })
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


