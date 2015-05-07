var Twitter = require('twitter');
var database = require('../scripts/database');
var strings = require('../scripts/strings');
var locations = require('../scripts/locations');
var helper = require('../scripts/helper');
var async = require('async');
var _ = require('underscore')._;

var client = new Twitter({
	consumer_key: 'x2cklAq9Vf7WSBdrPedAhSnRU',
	consumer_secret: 'cdpgZzz89QbxmsokRGUuuWedh1swZYuOgssGPb2q98aohOlhVR',
	access_token_key: '124413231-FR9z7MhAgASXyTwrSz9UKeOpANULxZrbmcE0sMxh',
	access_token_secret: 'uJLRVqlcoEIpXr2uOVWODkUPlblQZVQ1kXeFsMOgDzyJo'
});

var getSafeDelayBetweenRequests = function() {
	var allowedRequests = 180;
	var interval = 15 * 60 * 1000;
	var delay = Math.ceil(interval / allowedRequests);
	var safeDelay = Math.ceil(delay * 1.1);
	return safeDelay;
}

var getStream = function(searchText, callback) {
	client.stream('statuses/filter', { track: searchText, language: 'en' },  function(stream) {
		stream.on('data', function(tweet) {
			callback(null, tweet);
		});

		stream.on('error', function(error) {
			callback(error, null);
		});
	});
}

function URLToArray(url) {
	var request = {};
	var pairs = url.substring(url.indexOf('?') + 1).split('&');
	for (var i = 0; i < pairs.length; i++) {
	var pair = pairs[i].split('=');
	request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	}
	return request;
}

var getPage = function(searchOptions, callback) {
	client.get('search/tweets', searchOptions, function(error, tweets, response) {
		if (error) {
			callback(error, null, null);

		} else {
			var nextSearchOptions;
			if (tweets.search_metadata.next_results) {
				 nextSearchOptions = URLToArray(tweets.search_metadata.next_results);
			}
			callback(null, tweets.statuses, nextSearchOptions);

		}

	});
}

// callback takes params error, tweets
var saveTweetArray = function(tweetsToSave, options, callback) {
	var savedTweets = [];
	async.eachSeries(tweetsToSave, function(tweet, asyncCallback) {
		// set the extra data about the tweet
		if (options.product) {
			tweet.product = options.product;
		}
		if (options.demand) {
			tweet.indicatesDemand = true;
		} else {
			tweet.indicatesDemand = false;
		}

		database.saveTweet(tweet, function(error, savedTweet) {
			if (error) {
				asyncCallback(error);
				return;
			}
			
			if (savedTweet) {
				savedTweets.push(savedTweet);
			}
			asyncCallback();
		});

	}, function(error) {
		if (error) {
			callback(error, null)
			return;
		}

		callback(null, savedTweets);
	});
}

// callback takes params (error, tweets)
var doSearch = function(searchText, options, callback) {
	var batch = 100;
	var searchOptions = {};
	searchOptions.q = searchText;
	searchOptions.lang = 'en';
	// searchOptions.result_type = 'recent';
	searchOptions.count = batch;
	if (options.latitude && options.longitude && options.radius) {
		var geocodeString = options.latitude + "," + options.longitude + "," + options.radius + "km";
		searchOptions.geocode = geocodeString;
	}

	// saveCallback takes params (error, tweets)
	var saveTweetBatch = function(tweets, saveCallback) {
		if (!options.save) {
			saveCallback(null, []);
			return;
		}

		saveTweetArray(tweets, options, function(error, savedTweets) {
			if (error) {
				saveCallback(error, null);
				return;
			}

			saveCallback(null, savedTweets);
		});
	};

	var allTweets = [];
	var receivedTweetsCount = 0;
	var geoTweetsCount = 0;

	var callGetPage = function(searchOptions, getPageCallback) {
		if (!options.delayBetweenRequests) {
			getPage(searchOptions, getPageCallback);
			return;
		}

		// otherwise call it after the specified delay
		console.log("waiting for " + options.delayBetweenRequests / 1000 + " seconds before next request...");
		setTimeout(function() {
			getPage(searchOptions, getPageCallback);
		}, options.delayBetweenRequests);
	}

	var getPageCallback = function(error, tweets, nextSearchOptions) {
		if (error) {
			callback(error, null);
			return;

		}

		receivedTweetsCount += tweets.length;
		if (!options.save) {
			allTweets = allTweets.concat(tweets);
		}

		geoTweetsCount += _.filter(tweets, function(tweet) { return tweet.geo; }).length;
		console.log("current search: " + searchText + ", received tweets: " + receivedTweetsCount + " of which " + geoTweetsCount + " are geo.");

		saveTweetBatch(tweets, function(error, savedTweets) {
			if (error) {
				callback(error, null);
				return;
			}

			console.log("saved " + savedTweets.length + " tweets");

			if (!nextSearchOptions || (options.limit && allTweets.length >= options.limit)) {
				callback(null, allTweets);
				return;
			}

			callGetPage(nextSearchOptions, getPageCallback);

		});

	};

	callGetPage(searchOptions, getPageCallback);
}

// callback takes params error, tweets
var getRandomSample = function(size, searchText, options, callback) {
	options.limit = 1000;
	doSearch(searchText, options, function(error, tweets) {
		if (error) {
			callback(error, null);
			return;
		}

		var randomTweets = helper.getRandomSample(size, tweets);
		callback(null, randomTweets);
	});
}

// callback has params error, tweets
// limit is on each search
var getTweets = function(options, callback) {
	if (!options.product) {
		callback("No product given", null);
		return;
	}

	// get the searches we are performing
	var searches;
	if (options.demand) {
		searches = strings.getSearchStringsForProduct(options.product, options);
	} else {
		searches = [options.product];
	}

	var allTweets = [];
	async.eachSeries(searches, function(search, asyncCallback) {
		doSearch(search, options, function(error, tweets) {
			if (error) {
				asyncCallback(error);
				return;
			}

			allTweets = allTweets.concat(tweets);
			asyncCallback();
		});

	}, function(error) {
		if (error) {
			callback(error, null);
			return;
		}

		callback(null, allTweets);
	});
};

// callback has params error, tweets
var saveTweets = function(options, callback) {
	options.save = true;
	getTweets(options, function(error, tweets) {
		if (error) {
			callback(error, null);
			return;
		}

		callback(null, tweets);
	});
}

module.exports.getRandomSample = getRandomSample;
module.exports.saveTweets = saveTweets;
module.exports.getSafeDelayBetweenRequests = getSafeDelayBetweenRequests;


