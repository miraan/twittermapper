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
      value: 7,
      min: 1,
      max: 9,
      step: 1,
      timeBack: 168,
      text: '1 week'
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
        state: 'navBtnActive',
      },
      timeline: {
        state: 'navBtn',
      },
      geochart: {
        state: 'navBtn',
      },
      wordcloud: {
        state: 'navBtn',
      }
    };

    $scope.active = $scope.menu.map;
    $scope.setActive = function(active){
      $scope.active.state = 'navBtn';
      active.state = 'navBtnActive';
      $scope.active = active;
    };

    $scope.evalSlide = function() {
      switch ($scope.products.slider.value) {
        case '1':
          $scope.products.slider.timeBack = 1;
          $scope.products.slider.text = '1 hour';
          break;
        case '2':
          $scope.products.slider.timeBack = 3;
          $scope.products.slider.text = '3 hours';
          break;
        case '3':
          $scope.products.slider.timeBack = 12;
          $scope.products.slider.text = '12 hours';
          break;
        case '4':
          $scope.products.slider.timeBack = 24;
          $scope.products.slider.text = '1 day';
          break;
        case '5':
          $scope.products.slider.timeBack = 48;
          $scope.products.slider.text = '2 days';
          break;
        case '6':
          $scope.products.slider.timeBack = 120;
          $scope.products.slider.text = '5 days';
          break;
        case '7':
          $scope.products.slider.timeBack = 168;
          $scope.products.slider.text = 'one week';
          break;
        case '8':
          $scope.products.slider.timeBack = 240;
          $scope.products.slider.text = '10 days';
          break;
        case '9':
          $scope.products.slider.timeBack = 720;
          $scope.products.slider.text = '1 month';
          break;
        default:
          console.log('default');
      }
    };
  }
]);