var database = require('../scripts/database');
var twitter = require('../scripts/twitter');
var strings = require('../scripts/strings');
var locations = require('../scripts/locations');
var helper = require('../scripts/helper');
var analysis = require('../scripts/analysis');
var _ = require('underscore')._;
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');
var async = require('async');

require('../scripts/models/Tweet');

var Tweet = mongoose.model('Tweet');

var wipeDatabase = function() {
	database.wipeDatabase(function(error) {
		if (error) {
			console.log("Error wiping database");
			return;
		}

		console.log("Wiped database successfully");
	});
}

var outputRandomSample = function(searchText) {
	twitter.getRandomSample(options, function(error, tweets) {
		if (error) {
			console.log(error);
			return;
		}

		_.each(tweets, function(tweet) {
			console.log(tweet.text);
		});
	});
}

var saveTweets = function(options) {
	twitter.saveTweets(options, function(error, tweets) {
		if (error) {
			console.log(error);
			return;
		}

		var tweetType = "general";
		if (options.demand) {
			tweetType = "demand indicating";
		}
		if (options.product) {
			tweetType += " " + options.product;
		}

		console.log("Saved " + tweets.length + " " + tweetType + " tweets");
	});
}

var outputSavedTweets = function(options) {
	database.getTweets(options, function(error, tweets) {
		if (error) {
			console.log(error);
			return;
		}

		var tweetType = "general";
		if (options.demand) {
			tweetType = "demand indicating";
		}
		if (options.product) {
			tweetType += " " + options.product;
		}
		if (options.geo) {
			tweetType += " geo";
		}

		console.log("Found " + tweets.length + " " + tweetType + " tweets. Random sample of 10: ");
		_.each(helper.getRandomSample(10, tweets), function(tweet) { console.log(tweet.text); });
	});
}

var outputDemandGraph = function(product, dateLowerBound) {
	analysis.getDemandGraph(product, dateLowerBound, function(error, points) {
		if (error) {
			console.log(error);
			return;
		}

		// _.each(points, function(point) { console.log("Point: " + point); });
		console.log(JSON.stringify(points));
	});
}

// wipeDatabase();
// outputRandomSample("have iphone 6");
// saveTweets( { product: "iphone 6", demand: true } );
// outputSavedTweets({ product: "iphone 6", demand: false, geo: true, sort: "created_at"});
// outputSavedTweets({});
outputDemandGraph("iphone 6", helper.daysAgo(5));


