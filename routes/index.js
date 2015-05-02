var express = require('express');
var sentiment = require('sentiment');
var request = require('request');
var _ = require('underscore')._;
var async = require('async');
var twitter = require('../scripts/twitter');
var database = require('../scripts/database');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/markers', function(req, res, next) {
	res.json([]);
});

// database.getTweets(function(error, tweets) {
// 	if (error) {
// 		console.log("Error getting tweets from db: " + error);
// 		return;
// 	}

// 	console.log("Tweets: " + tweets);
// });

/*
// Sentiment

var getSentiment = function(text, callback) {
	request.post({ url: 'http://text-processing.com/api/sentiment/', form: { text: text }}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(null, body);
		} else {
			callback("Error getting sentiment: statusCode: " + statusCode, null);
		}
	});
};

var getQuickSentiment = function(text, callback) {
	var result = sentiment(text);
	return result.comparative;
}

// @param 	search 		String: the search text to send to the twitter search api
// @param 	latitude 	Double
// @param 	longitude 	Double
// @param 	radius	 	Double
// @param 	callback 	"value",  "value", a function that will execute when the score has been acquired
//						of form callback(error, score)
// Returns a score between -1 and 1
var getScoreForSearch = function(search, latitude, longitude, radius, callback) {
	var geocodeString = latitude + "," + longitude + "," + radius + "km";
	client.get('search/tweets', {q: search, geocode: geocodeString, lang: 'en'}, function(error, tweets, response) {
		if (!error) {
			var list = tweets.statuses;

			// will only use the top 10 tweets ordered by number of followers
			list = _.sortBy(list, function(tweet) {
				return tweet.user.followers_count;
			});
			if (list.length > 10) {
				list = list.slice(-10, list.length);
			}

			var totalScore = 0;
			// async.each allows us to call multiple async functions in a loop (to run in parallel)
			// and wait for all of them to complete before moving to asyncCallback
			async.each(list, function(tweet, asyncCallback) {
				getSentiment(tweet.text, function(error, body) {
					var jsonResponse = JSON.parse(body);
					if (!error) {
						if (jsonResponse.label == "pos") {
							totalScore++;
							console.log("+1: " + tweet.text);
						} else if (jsonResponse.label == "neg") {
							totalScore--;
							console.log("-1:" + tweet.text);
						}
						asyncCallback();

					} else {
						asyncCallback(error);
					}
				});

			}, function(error) {
				if (error) {
					callback(error, null);

				} else {
					var averageScore = totalScore / list.length;
					callback(null, averageScore);

				}

			});

		} else {
			callback(error, null);

		}

	});
};

test
getScoreForSearch("megan fox", 51.5286416, -0.1015987, 1000, function(error, score) {
	if (!error) {
		console.log("Score: " + score);

	} else {
		console.log("getScoreForSearch error: " + error);

	}
});
*/

module.exports = router;
