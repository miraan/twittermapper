google.load('visualization', '1', {packages:['corechart','geochart']});
 
google.setOnLoadCallback(function () {
  angular.bootstrap(document.body, ['oxTwi']);
});

var app = angular.module('oxTwi', ['ui.router','ngMap','ui.bootstrap']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('map', {
      url: '/map/{id}',
      templateUrl: 'Views/map.html',
      controller: 'MapCtrl',
      resolve: {
        markerPromise: ['markers', function(markers) {
          return markers.getAll();
        }],
        selectionPromise: ['globalSelection', function(selection) {
          if (selection.needToRequest) {
            return selection.getAll();
          } else {
            return null;
          }
        }]
      }
    })
    .state('timeline', {
      url: '/timeline/{id}',
      templateUrl: 'Views/timeline.html',
      controller: 'TimelineCtrl',
      resolve: {
        markerPromise: ['graphData', function(graphData) {
          return graphData.getAll();
        }],
        selectionPromise: ['globalSelection', function(selection) {
          if (selection.needToRequest) {
            return selection.getAll();
          } else {
            return null;
          }
        }]
      }
    })
    .state('geochart', {
      url: '/geochart/{id}',
      templateUrl: 'Views/geochart.html',
      controller: 'GeoChartCtrl',
      resolve: {
        markerPromise: ['graphData', function(graphData) {
          return graphData.getAll();
        }],
        selectionPromise: ['globalSelection', function(selection) {
          if (selection.needToRequest) {
            return selection.getAll();
          } else {
            return null;
          }
        }]
      }
    })
    .state('wordcloud', {
      url: '/wordcloud/{id}',
      templateUrl: 'Views/wordcloud.html',
      controller: 'WordCloudCtrl',
      resolve: {
        markerPromise: ['graphData', function(graphData) {
          return graphData.getAll();
        }],
        selectionPromise: ['globalSelection', function(selection) {
          if (selection.needToRequest) {
            return selection.getAll();
          } else {
            return null;
          }
        }]
      }
    });

  $urlRouterProvider.otherwise('map/0');
}]);

app.factory('globalSelection', ['$http', function($http) {
  var o = {
    needToRequest: true,

    slider: {
      value: 5,
      min: 1,
      max: 7,
      step: 1
    },

    showDemand: true,
    showSentiment: false,
    currentTopic: "",
    currentTopicOptions: [],
    currentOptionIndex: 0,
    currentTopicClass: "",

    topics: [],
    topicsOptions: [[]]
  };

  o.getAll = function() {
    o.haveCategories = true;
    return $http.get('/getCategories').success(function(data){
      var object = {
        data: {}
      }
      angular.copy(data, object.data);
      o.topics = object.data.topics;
      o.topicsOptions = object.data.topicsOptions;
    });
  };

  return o;

}]);

app.controller('MenuCtrl', [
  '$scope',
  'globalSelection',
  function($scope, products, globalSelection){
    $scope.searchText = "What would you like to search for?";

    $scope.getToTyping = function(){
      $scope.searchText = "";
      $scope.searchFocus = true;
    }
    $scope.finishTyping = function(){
      $scope.searchFocus = false;
      $scope.searchText = "What would you like to search for?";
    }
    $scope.submitSearch = function(){
      if ($scope.searchText != null && $scope.searchText != "") { 
        $scope.products.currentTopic = $scope.searchText;
        $scope.products.currentTopicClass = $scope.searchText;
        $scope.products.currentTopicOptions = [];
        $scope.products.currentOptionIndex = 0;
      } 
      $scope.finishTyping();
      $scope.hideAll();
    }

    $scope.products = products;

    $scope.selecTopic = function(topicI){ // I is for index
      $scope.products.currentOptionIndex = 0;
      $scope.brighten = true;
      $scope.products.currentTopicClass = $scope.products.topics[topicI];
      $scope.products.currentTopic = $scope.products.topics[topicI];
      $scope.products.currentTopicOptions = $scope.products.topicsOptions[topicI];
      $scope.hideAll();
    };
    $scope.selectOption = function(optionI){
      $scope.products.currentOptionIndex = optionI;
      if (optionI == 0) { $scope.products.currentTopic = $scope.products.currentTopicClass; }
      else { $scope.products.currentTopic = $scope.products.currentTopicOptions[optionI]; }
      $scope.hideAll();
    };
    $scope.hideAll = function(){
      $scope.optionsHidden = true;
      $scope.optionsViewIsT = false;
    };
    $scope.showOptions = function(){
      $scope.optionsHidden = false;
    };
    $scope.toggleTopiClasses = function(){
      $scope.optionsViewIsT = !$scope.optionsViewIsT;
    };
    $scope.isTopiClass = function(t){
      return t != $scope.products.currentTopiClass;
    };
    $scope.makeDemand = function(){
      $scope.products.showDemand = true;
      $scope.products.showSentiment = false;
    };
    $scope.makeSentiment = function(){
      $scope.products.showSentiment = true;
      $scope.products.showDemand = false;
    };

    $scope.menu = {
      map: {
        state: 'active',
      },
      timeline: {
        state: '',
      },
      geochart: {
        state: '',
      },
      wordcloud: {
        state: '',
      }
    };

    $scope.active = $scope.menu.map;
    $scope.setActive = function(active){
      $scope.active.state = "";
      active.state = 'active';
      $scope.active = active;
    };
  }
]);