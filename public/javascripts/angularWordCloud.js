app.directive('wordcloud', function() {
  return {
    restrict: 'A',
    link: function($scope, elm, attrs) {
      //console.log($scope.graphData.wordCloud);
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

app.controller('WordCloudCtrl', [
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


