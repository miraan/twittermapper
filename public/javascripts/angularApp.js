google.load('visualization', '1', {packages:['corechart','geochart']});
 
google.setOnLoadCallback(function () {
  angular.bootstrap(document.body, ['oxTwi']);
});

var app = angular.module('oxTwi', ['ui.router','ngMap']);

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
            selection.needToRequest = false;
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
            selection.needToRequest = false;
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
            selection.needToRequest = false;
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
            selection.needToRequest = false;
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
    loading: {
      loadingData: false
    },

    slider: {
      value: 7,
      newValue: 7,
      min: 1,
      max: 7,
      step: 1,
      text: 'past week'
    },

    showDemand: true,
    showStock: false,
    currentTopic: "",
    currentProducts: [],
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

app.filter('capitalize', function() {
  return function(input, all) {
    return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
  }
});

app.controller('MenuCtrl', [
  '$scope',
  'globalSelection',
  function($scope, products, globalSelection){

    $scope.products = products;

    $scope.demandBtnClass = function (){
      if (products.showDemand){
        return 'active';
      } else {
        return '';
      }
    };

    $scope.stockBtnClass = function (){
      if (products.showStock){
        return 'active';
      } else {
        return '';
      }
    };

    $scope.sentimentBtnClass = function (){
      if (products.showDemand){
        return '';
      } else {
        return 'active';
      }
    };

    $scope.getState = function(location) {
      if (window.location.hash==location) {
        return 'active';
      } else {
        return '';
      }
    };

    $scope.showCategories = false;

    $scope.toggleCategories = function() {
      $scope.showCategories = !($scope.showCategories);
    };

    $scope.getTopicClass = function(topic){
      if (topic == $scope.products.currentTopicClass) {
        return 'active';
      } else {
        return '';
      }
    };

    $scope.getProductClass = function(index){
      if ($scope.products.isCurrentView('#/map')||$scope.products.isCurrentView('#/timeline')) {
        if ($scope.products.currentProducts[index]) return 'active'
        else return '';
      } else {
        if (index==$scope.products.currentOptionIndex ) return 'active'
        else return '';
      };
    };

    $scope.getLink = function(location) {
      return window.location.hash;
    };

    $scope.selecTopic = function(topicI){ // I is for index
      $scope.products.currentOptionIndex = 0;
      $scope.brighten = true;
      $scope.products.currentTopic = $scope.products.topics[topicI];
      $scope.products.currentTopicOptions = $scope.products.topicsOptions[topicI];
      $scope.products.currentProducts = [];
      $scope.products.currentProducts.push(true);
      for (var i=1; i<$scope.products.currentTopicOptions.length; i++){
        $scope.products.currentProducts.push(false);
      };
      $scope.products.currentTopicClass = $scope.products.topics[topicI];
      $scope.showCategories = false;
    };
    $scope.selectOption = function(optionI){
      if ($scope.products.isCurrentView('#/map')||$scope.products.isCurrentView('#/timeline')) {
        $scope.products.currentProducts[optionI] = !($scope.products.currentProducts[optionI]);
        if(optionI!=0 && $scope.products.isCurrentView('#/map')) {
          $scope.products.currentProducts[0] = false;
        };
        if(optionI==0 && $scope.products.isCurrentView('#/map')) {
          for (var i=1; i<$scope.products.currentProducts.length; i++){
            $scope.products.currentProducts[i] = false;
          };  
        };
      } else {
        $scope.products.currentOptionIndex = optionI;
        if (optionI == 0) { $scope.products.currentTopic = $scope.products.currentTopicClass; }
        else { $scope.products.currentTopic = $scope.products.currentTopicOptions[optionI]; }
      }
    };

    $scope.selectFirstOption = function(optionI){
      if ($scope.products.isCurrentView('#/map')||$scope.products.isCurrentView('#/timeline')) {
        $scope.products.currentProducts[0] = false;
        $scope.products.currentProducts[optionI] = !($scope.products.currentProducts[optionI]);

      } else {
        $scope.products.currentOptionIndex = optionI;
        if (optionI == 0) { $scope.products.currentTopic = $scope.products.currentTopicClass; }
        else { $scope.products.currentTopic = $scope.products.currentTopicOptions[optionI]; }
      }
    };
    
    $scope.makeDemand = function(){
      $scope.products.showDemand = true;
    };
    $scope.makeSentiment = function(){
      $scope.products.showDemand = false;
    };

    $scope.showStock = function(){
      $scope.products.showStock = !($scope.products.showStock);
    };

    $scope.evalSlide = function() {
      switch ($scope.products.slider.value) {
        case '1':
          $scope.products.slider.text = 'Past 24 Hours';
          break;
        case '2':
          $scope.products.slider.text = 'Past 2 Days';
          break;
        case '3':
          $scope.products.slider.text = 'Past 3 Days';
          break;
        case '4':
          $scope.products.slider.text = 'Past 4 Days';
          break;
        case '5':
          $scope.products.slider.text = 'Past 5 Days';
          break;
        case '6':
          $scope.products.slider.text = 'Past 6 Days';
          break;
        case '7':
          $scope.products.slider.text = 'Past Week';
          break;
        default:
          console.log('default');
      }
    };

    $scope.showTiles = function() {
      $scope.brighten = false;
    }

  }
]);