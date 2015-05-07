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
      url: '/map',
      templateUrl: 'Views/map.html',
      controller: 'MapCtrl',
      resolve: {
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
      url: '/timeline',
      templateUrl: 'Views/timeline.html',
      controller: 'TimelineCtrl',
      resolve: {
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
      url: '/geochart',
      templateUrl: 'Views/geochart.html',
      controller: 'GeoChartCtrl',
      resolve: {
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
      url: '/wordcloud',
      templateUrl: 'Views/wordcloud.html',
      controller: 'WordCloudCtrl',
      resolve: {
        selectionPromise: ['globalSelection', function(selection) {
          if (selection.needToRequest) {
            return selection.getAll();
          } else {
            return null;
          }
        }]
      }
    });

  $urlRouterProvider.otherwise('map');
}]);

app.factory('globalSelection', ['$http', function($http) {
  var o = {
    needToRequest: true,

    slider: {
      value: 7,
      newValue: 7,
      min: 1,
      max: 7,
      step: 1,
      text: '1 week'
    },

    showDemand: true,
    showSentiment: false,
    currentTopic: "",
    currentTopicOptions: [],
    currentOptionIndex: 0,
    currentTopicClass: "",

    topics: [],
    topicsOptions: [[]],

    isCurrentView: function(view){
      return window.location.hash==view;
    }
  };

  o.getAll = function() {
    o.haveCategories = true;
    return $http.get('/getCategories').success(function(data){
      console.log(data);
      var object = {
        data: {}
      }
      angular.copy(data, object.data);
      o.topics = object.data.topics;
      console.log(o.topics);
      o.topicsOptions = object.data.topicsOptions;
      console.log(o.topicsOptions);
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
        $scope.products.currentTopicOptions = [];
        $scope.products.currentOptionIndex = 0;
        $scope.products.currentTopicClass = $scope.searchText;
      } 
      $scope.finishTyping();
      $scope.hideAll();
    }

    $scope.products = products;

    $scope.selecTopic = function(topicI){ // I is for index
      $scope.products.currentOptionIndex = 0;
      $scope.brighten = true;
      $scope.products.currentTopic = $scope.products.topics[topicI];
      $scope.products.currentTopicOptions = $scope.products.topicsOptions[topicI];
      $scope.products.currentTopicClass = $scope.products.topics[topicI];
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

    $scope.getState = function(location) {
      if (window.location.hash==location) {
        return 'navBtnActive';
      } else {
        return 'navBtn';
      };
    };

    $scope.evalSlide = function() {
      switch ($scope.products.slider.value) {
        case '1':
          $scope.products.slider.text = '1 day';
          break;
        case '2':
          $scope.products.slider.text = '2 days';
          break;
        case '3':
          $scope.products.slider.text = '3 days';
          break;
        case '4':
          $scope.products.slider.text = '4 days';
          break;
        case '5':
          $scope.products.slider.text = '5 days';
          break;
        case '6':
          $scope.products.slider.text = '6 days';
          break;
        case '7':
          $scope.products.slider.text = '1 week';
          break;
        default:
          console.log('default');
      }
    };

  }
]);