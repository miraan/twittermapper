var Twitter = require('twitter');
var database = require('../scripts/database');
var strings = require('../scripts/strings');
var _ = require('underscore')._;

var client = new Twitter({
	consumer_key: 'x2cklAq9Vf7WSBdrPedAhSnRU',
	consumer_secret: 'cdpgZzz89QbxmsokRGUuuWedh1swZYuOgssGPb2q98aohOlhVR',
	access_token_key: '124413231-FR9z7MhAgASXyTwrSz9UKeOpANULxZrbmcE0sMxh',
	access_token_secret: 'uJLRVqlcoEIpXr2uOVWODkUPlblQZVQ1kXeFsMOgDzyJo'
});

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

var saveStream = function(searchText) {
	console.log("Saving (stream: " + searchText + ")...");
	getStream(searchText, function(error, tweetJson) {
		if (!error) {
			tweetJson.searchText = searchText;
			database.saveTweet(tweetJson, function(error, tweet) {
				if (error) {
					console.log("Error saving tweet (stream: " + searchText + "): " + error);
					return;

				}

				console.log("Saved Tweet (stream: " + searchText + ")");
			});

		} else {
			console.log("Error getting tweet from (stream: " + searchText + "): " + error);
		}
	});
}

var saveStreamsForProduct = function(product) {
	var searchStrings = strings.getSearchStringsForProduct(product);
	_.each(searchStrings, function(searchString) {
		saveStream(searchString);
	});
}

var products = ["iphone 6", "galaxy s6", "htc one m9", "xperia z3"];
// below code doesn't work because twitter refuses that many stream connections
// _.each(products, function(product) {
// 	saveStreamsForProduct(product);
// });

saveStream("want lg g4");

module.exports.getStream = getStream;