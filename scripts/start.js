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

var outputRandomSample = function(size, searchText, options) {
	twitter.getRandomSample(size, searchText, options, function(error, tweets) {
		if (error) {
			console.log(error);
			return;
		}

		_.each(tweets, function(tweet) {
			console.log(tweet);
		});
	});
}

var saveTweets = function(options, callback) {
	twitter.saveTweets(options, function(error, tweets) {
		if (error) {
			console.log(error);
			if (callback) {
				callback(error);
			}
			return;
		}

		var tweetType = "general";
		if (options.demand) {
			tweetType = "demand indicating";
		}
		if (options.product) {
			tweetType += " " + options.product;
		}

		console.log("Saved " + tweetType + " tweets");
		if (callback) {
			callback();
		}
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

		console.log("Found " + tweets.length + " " + tweetType + " tweets.");
		// console.log("Random sample of 10:");
		// _.each(helper.getRandomSample(20, tweets), function(tweet) { console.log(tweet); });

		console.log("First 10: ");
		for (var i = 0; i < 10 && i < tweets.length; i++) { console.log(tweets[i]); }
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

var outputSentimentGraph = function(product, dateLowerBound) {
	analysis.getSentimentGraph(product, dateLowerBound, function(error, points) {
		if (error) {
			console.log("Error: " + error);
			return;
		}

		// _.each(points, function(point) { console.log("Point: " + point); });
		console.log("Result: " + JSON.stringify(points));
	});
}

var setupDatabase = function() {
	console.log("setting up database...");
	
	var functions = [];
	_.each(analysis.products()[0], function(mobileProduct) {
		var funcA = function(callback) {
			console.log("downloading demand tweets for " + mobileProduct);
			var options = { product: mobileProduct, demand: true, delayBetweenRequests: twitter.getSafeDelayBetweenRequests() };
			saveTweets(options, callback);
		};
		var funcB = function(callback) {
			console.log("downloading general tweets for " + mobileProduct);
			var options = { product: mobileProduct, demand: false, delayBetweenRequests: twitter.getSafeDelayBetweenRequests() };
			saveTweets(options, callback);
		};

		functions.push(funcA);
		functions.push(funcB);
	});

	_.each(analysis.products()[1], function(foodProduct) {
		var funcA = function(callback) {
			console.log("downloading demand tweets for " + foodProduct);
			var options = { product: foodProduct, demand: true, type: 'food', delayBetweenRequests: twitter.getSafeDelayBetweenRequests() };
			saveTweets(options, callback);
		};
		var funcB = function(callback) {
			console.log("downloading general tweets for " + foodProduct);
			var options = { product: foodProduct, demand: false, type: 'food', delayBetweenRequests: twitter.getSafeDelayBetweenRequests() };
			saveTweets(options, callback);
		};

		functions.push(funcA);
		functions.push(funcB);
	});

	_.each(analysis.products()[2], function(coffeeProduct) {
		var funcA = function(callback) {
			console.log("downloading demand tweets for " + coffeeProduct);
			var options = { product: coffeeProduct, demand: true, type: 'drink', delayBetweenRequests: twitter.getSafeDelayBetweenRequests() };
			saveTweets(options, callback);
		};
		var funcB = function(callback) {
			console.log("downloading general tweets for " + coffeeProduct);
			var options = { product: coffeeProduct, demand: false, type: 'drink', delayBetweenRequests: twitter.getSafeDelayBetweenRequests() };
			saveTweets(options, callback);
		};

		functions.push(funcA);
		functions.push(funcB);
	});

	async.series(functions, function(error) {
		if (error) {
			console.log("error setting up database: " + error);
			return;
		}

		console.log("finished setting up database successfully");
	});
}

// wipeDatabase();
// outputRandomSample(10, "have iphone 6", {latitude: 51.0, longitude: -0.5, radius: 10000});
// saveTweets( { product: "iphone 6", demand: false, delayBetweenRequests: twitter.getSafeDelayBetweenRequests() } );
// saveTweets( { product: "iphone 6", demand: true } );
// outputSavedTweets({ product: "iphone 6", countryExists: true, select: 'created_at country geo', limit: 1000 });
// outputSavedTweets({ limit: 10000, select: 'created_at product indicatesDemand' });
// outputDemandGraph("iphone 6", helper.daysAgo(7));
// outputSentimentGraph("iphone 6", helper.daysAgo(7));


module.exports.wipeDatabase = wipeDatabase;
module.exports.saveTweets = saveTweets;
module.exports.outputSavedTweets = outputSavedTweets;
module.exports.setupDatabase = setupDatabase;
