var _ = require('underscore')._;
var database = require('../scripts/database');

var categories = ["Mobile Phones", "Cars and Motorbikes"];
var products = [["iphone 6", "lg g4", "galaxy s6"], ["honda civic", "toyota auris"]];

var getProductsForCategory = function(category) {
	var categoryIndex = 0;
	while (categories[categoryIndex] != category && categoryIndex <= categories.length) {
		categoryIndex++;
	}
	if (categoryIndex == categories.length) {
		return [];
	}
	return products[categoryIndex];
}

var now = function() { return new Date(); }

// returns a 2d array [lowerBound, upperBound]
var getDateRange = function(daysInPast) {
	var upperBound = now();

	var lowerBound = now();
	lowerBound.setDate(upperBound.getDate() - daysInPast);

	return [lowerBound, upperBound];
}

// data is array of 2d arrays: data: [ [date, value] ]
// callback takes params (error, points) where points is an array of 'numberOfPoints' 2d arrays: [  ]
var getDemandGraph = function(product, dateLowerBound, callback) {
	database.getTweets( { product: product, demand: true, sort: 'created_at', dateLowerBound: dateLowerBound }, function(error, tweets) {
		if (error) {
			callback(error, null);
			return;
		}

		var numberOfSegments = 30; // also numberOfPoints
		var today = Math.floor(now().getTime());
		var lowerBound = Math.floor(dateLowerBound.getTime());
		var interval = Math.floor((today - lowerBound) / numberOfSegments);
		var segments = [];
		var start = lowerBound;

		// a segment is a 2d array [dateLowerBound, dateUpperBound]
		for (var i = 0; i < numberOfSegments; i++) {
			var segment = [start, start + interval];
			segments.push(segment);
			start += interval;
		}

		// we iterate through the tweets array
		// since it is sorted, we get each segment's count in one pass
		var points = [];
		var tweetIndex = 0;
		var numberOfTweets = tweets.length;

		for (var i = 0; i < numberOfSegments; i++) {
			var point = [];
			var segment = segments[i];

			point.push(segment[1]);
			// point.push(new Date(segment[1]));

			// get the tweet count for this segment
			var tweetCountForSegment = 0;
			while (tweetIndex < numberOfTweets && tweets[tweetIndex].created_at.getTime() <= segment[1]) {
				tweetCountForSegment++;
				tweetIndex++;
			}

			// var filteredTweets = _.filter(tweets, function(tweet) {
			// 	if (tweet.created_at.getTime() >= segment[0] && tweet.created_at.getTime() <= segment[1]) {
			// 		return true;
			// 	}
			// 	return false;
			// });

			point.push(tweetCountForSegment);

			points.push(point);
		}

		callback(null, points);
	});
}

// data is array of 2d arrays: data: [ [date, value] ]
// callback takes params (error, points) where points is an array of 'numberOfPoints' 2d arrays: [  ]
var getSentimentGraph = function(product, dateLowerBound, callback) {
	database.getTweets( { product: product, demand: true, sort: 'created_at', dateLowerBound: dateLowerBound }, function(error, tweets) {
		if (error) {
			callback(error, null);
			return;
		}

		var numberOfSegments = 30; // also numberOfPoints
		var today = Math.floor(now().getTime());
		var lowerBound = Math.floor(dateLowerBound.getTime());
		var interval = Math.floor((today - lowerBound) / numberOfSegments);
		var segments = [];
		var start = lowerBound;

		// a segment is a 2d array [dateLowerBound, dateUpperBound]
		for (var i = 0; i < numberOfSegments; i++) {
			var segment = [start, start + interval];
			segments.push(segment);
			start += interval;
		}

		// we iterate through the tweets array
		// since it is sorted, we get each segment's count in one pass
		var points = [];
		var tweetIndex = 0;
		var numberOfTweets = tweets.length;

		for (var i = 0; i < numberOfSegments; i++) {
			var point = [];
			var segment = segments[i];

			point.push(segment[1]);
			// point.push(new Date(segment[1]));

			// get the tweet count for this segment
			var tweetCountForSegment = 0;
			while (tweetIndex < numberOfTweets && tweets[tweetIndex].created_at.getTime() <= segment[1]) {
				tweetCountForSegment++;
				tweetIndex++;
			}

			// var filteredTweets = _.filter(tweets, function(tweet) {
			// 	if (tweet.created_at.getTime() >= segment[0] && tweet.created_at.getTime() <= segment[1]) {
			// 		return true;
			// 	}
			// 	return false;
			// });

			point.push(tweetCountForSegment);

			points.push(point);
		}

		callback(null, points.reverse());
	});
}

module.exports.getDemandGraph = getDemandGraph;
module.exports.getSentimentGraph = getSentimentGraph;
module.exports.getProductsForCategory = getProductsForCategory;