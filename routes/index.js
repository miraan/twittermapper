var express = require('express');
var router = express.Router();
var async = require('async');
var analysis = require('../scripts/analysis');
var helper = require('../scripts/helper');
var start = require('../scripts/start');
var twitter = require('../scripts/twitter');
var database = require('../scripts/database');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/getCategories', function(req, res, next) {
	res.json(analysis.getCategories());
});

router.get('/getGraph/:category/:days', function(req, res, next) {
	var category = req.params.category;
	var days = req.params.days;
	var dateLowerBound = helper.daysAgo(days);

	analysis.getGraphForCategory(category, dateLowerBound, function(error, graph) {
		if (error) {
			res.error(error);
			return;
		}

		res.json(graph);
	});
});

router.get('/getLocations/:category/:days', function(req, res, next) {
	var category = req.params.category;
	var days = req.params.days;
	var dateLowerBound = helper.daysAgo(days);

	analysis.getLocationsForCategory(category, dateLowerBound, function(error, locations) {
		if (error) {
			res.error(error);
			return;
		}

		res.json(locations);
	});
});

router.get('/getWordCloud/:category/:days', function(req, res, next) {
	var category = req.params.category;
	var days = req.params.days;
	var dateLowerBound = helper.daysAgo(days);

	analysis.getWordCloudForCategory(category, dateLowerBound, function(error, words) {
		if (error) {
			res.error(error);
			return;
		}

		res.json(words);
	});
});

router.get('/getGeoChart/:category/:days', function(req, res, next) {
	var category = req.params.category;
	var days = req.params.days;
	var dateLowerBound = helper.daysAgo(days);

	analysis.getGeoChartForCategory(category, dateLowerBound, function(error, data) {
		if (error) {
			res.error(error);
			return;
		}

		res.json(data);
	});
});

router.get('/getTweet/:tweetId', function(req, res, next) {
	var tweetId = req.params.tweetId;

	analysis.getTweet(tweetId, function(error, tweet) {
		if (error) {
			res.error(error);
			return;
		}

		res.json(tweet);
	});
});

router.get('/setup/wipeDatabase', function(req, res, next) {
	start.wipeDatabase();
	res.json({ message: "Wiping Database"});
});

router.get('/setup/saveTweets/:product/:demand/:delay', function(req, res, next) {
	var product = req.params.product;
	var demand = req.params.demand;
	var delay = req.params.delay;

	var options = { product: product, demand: demand };
	if (delay == "true") {
		options.delayBetweenRequests = twitter.getSafeDelayBetweenRequests();
	}
	start.saveTweets(options);
});

router.get('/setup/outputSavedTweets/:product/:demand/:select/:limit', function(req, res, next) {
	var product = req.params.product;
	var demand = req.params.demand;
	var select = req.params.select;
	var limit = req.params.limit;

	var options = { product: product, select: select, limit: limit };

	database.getTweets(options, function(error, tweets) {
		if (error) {
			res.error(error);
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

		var result = {};
		result.message = "Found " + tweets.length + " " + tweetType + " tweets. First 10:";
		result.tweets = [];
		for (var i = 0; i < 10 && i < tweets.length; i++) { result.tweets.push[tweets[i]]; }

		res.json(result);
	});
});

module.exports = router;
