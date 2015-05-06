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
        markerPromise: ['markers', function(markers) {
          return markers.getAll();
        }]
      }
    })
    .state('graphs', {
      url: '/graphs/{id}',
      templateUrl: 'Views/graphs.html',
      controller: 'GraphsCtrl',
      resolve: {
        markerPromise: ['graphData', function(graphData) {
          return graphData.getAll();
        }]
      }
    });

  $urlRouterProvider.otherwise('map');
}]);

app.factory('products', ['$http', function($http) {
  var object = {
    slider: {
      value: 5,
      min: 1,
      max: 10,
      step: 1
    },
    showDemand: true,
    showSentiment: false,
    currentTopic: "",
    currentTopicOptions: [],
    currentOptionIndex: 0,
    currentTopicClass: "",
    topics: [
      "Apps and Games",
      "Books",
      "Cars and Motorbikes",
      "Computers and Accessories",
      "Watches"
    ],
    topicsOptions: [
      ["Entire Market","Temple Run","Cut the Rope","iFitness","Tripr"], // Apps and Games
      ["Entire Market"], // Books
      ["Entire Market"], // Cars and Motorbikes
      ["Entire Market"], // Computers and Accessories
      ["Entire Market","iWatch","Casio watch"]  // Watches
    ],
  };
  return object;
}]);

app.controller('MenuCtrl', [
  '$scope',
  'products',
  function($scope, products){
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
      graphs: {
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