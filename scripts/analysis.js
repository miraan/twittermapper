var _ = require('underscore')._;
var sentiment = require('sentiment');
var async = require('async');
var database = require('../scripts/database');
var helper = require('../scripts/helper');

var categories = ["mobile phones", "cars and motorbikes"];
var products = [["iphone 6", "lg g4", "galaxy s6"], ["honda civic", "toyota auris"]];

// tweets is an array of tweet objects where each object has at least the property 'text'
var countWordsInTweets = function(tweets) {
  	var index = {};
  	_.each(tweets, function(tweet) {
		var words = tweet.text
		.replace(/[.,?!;()"'-]/g, " ")
		.replace(/\s+/g, " ")
		.toLowerCase()
		.split(" ");

		_.each(words, function(word) {
			if (!(index.hasOwnProperty(word))) {
				index[word] = 0;
			}
			index[word]++;
		});
  	});
    return index;
}

// tweets is an array of tweet objects where each object has at least the property 'country_code'
var getCountryCountForTweets = function(tweets) {
	var index = {};
	_.each(tweets, function(tweet) {
		if (!(index.hasOwnProperty(tweet.country_code))) {
			index[tweet.country_code] = 0;
		}
		index[tweet.country_code]++;
	});
	return index;
}

// tweets is an array of tweet objects where each object has at least the properties 'country_code' and 'text'
var getCountrySentimentForTweets = function(tweets) {
	var index = {};
	_.each(tweets, function(tweet) {
		if (!(index.hasOwnProperty(tweet.country_code))) {
			index[tweet.country_code] = 0;
		}
		index[tweet.country_code] += sentiment(tweet.text).score;
	});
	return index;
}

// charts is an array of charts, where a chart is a 2d string array [country, value]
// returns the chart with the values for each chart summed together
var sumCountryCharts = function(charts) {
	var index = {};
	_.each(charts, function(chart) {
		_.each(chart, function(pair) {
			var country = pair[0];
			var value = pair[1];
			if (!(index.hasOwnProperty(country))) {
				index[country] = 0;
			}
			index[country] += value;
		});
	});

	var chart = [];
	_.each(_.keys(index), function(key) {
		chart.push([key, index[key]]);
	});

	return chart;
}

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

var getCategories = function() {
	var result = {};
	result.topics = categories;
	result.topicsOptions = products;
	for (var i = 0; i < result.topicsOptions.length; i++) {
		result.topicsOptions[i].unshift("entire market");
	}
	return result;
}

var now = function() { return new Date(); }

// returns a 2d array [lowerBound, upperBound]
var getDateRange = function(daysInPast) {
	var upperBound = now();

	var lowerBound = now();
	lowerBound.setDate(upperBound.getDate() - daysInPast);

	return [lowerBound, upperBound];
}

// lines is an array of arrays of 2d arrays (an array of lines), assume all have the same number of points
// returns the line that represents the average of the lines
var getAverageLine = function(lines) {
	var averageLine = [];
	if (lines.length < 1) {
		return averageLine;
	}

	var firstLine = lines[0];
	for (var i = 0; i < firstLine.length; i++) {
		// for each point, calculate the average
		var point = [];
		var pointTime = firstLine[i][0];
	
		var total = 0;
		for (var j = 0; j < lines.length; j++) {
			// for each line, get the point value
			var pointValue = lines[j][i][1];
			total += pointValue;
		}
		var averageValue = Math.round(total / lines.length);

		point.push(pointTime);
		point.push(averageValue);

		averageLine.push(point);
	}

	return averageLine;
}

// data is array of 2d arrays: data: [ [date, value] ]
// callback takes params (error, points) where points is an array of 'numberOfPoints' 2d arrays: [  ]
var getDemandGraphForProduct = function(product, dateLowerBound, callback) {
	database.getTweets( { product: product, demand: true, sort: 'created_at', select: 'created_at', dateLowerBound: dateLowerBound }, function(error, tweets) {
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

			point.push(tweetCountForSegment);

			points.push(point);
		}

		callback(null, points);
	});
}

// data is array of 2d arrays: data: [ [date, value] ]
// callback takes params (error, points) where points is an array of 'numberOfPoints' 2d arrays: [  ]
var getSentimentGraphForProduct = function(product, dateLowerBound, callback) {
	database.getTweets( { product: product, demand: false, sort: 'created_at', select: 'created_at text', dateLowerBound: dateLowerBound }, function(error, tweets) {
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

			// get the sentiment for this segment
			var totalSentiment = 0;
			while (tweetIndex < numberOfTweets && tweets[tweetIndex].created_at.getTime() <= segment[1]) {
				totalSentiment += sentiment(tweets[tweetIndex].text).score;
				tweetIndex++;
			}

			point.push(totalSentiment);
			points.push(point);
		}

		callback(null, points);
	});
}

// callback takes params (error, data) where data is an array of objects with fields product, demand, sentiment
// where demand and sentiment are arrays of graph points
var getGraphForCategory = function(category, dateLowerBound, callback) {
	var products = getProductsForCategory(category);
	var data = [];

	async.each(products, function(product, callback) {
		var item = {};
		item.product = product;
		
		var getDemand = function(callback) {
			getDemandGraphForProduct(product, dateLowerBound, function(error, points) {
				if (error) {
					callback(error);
					return;
				}

				item.demand = points;
				callback();
			});
		}

		var getSentiment = function(callback) {
			getSentimentGraphForProduct(product, dateLowerBound, function(error, points) {
				if (error) {
					callback(error);
					return;
				}

				item.sentiment = points;
				callback();
			});
		}

		async.parallel([getDemand, getSentiment], function(error) {
			if (error) {
				callback(error);
				return;
			}

			data.push(item);
			callback();
		});

	}, function(error) {
		if (error) {
			callback(error);
			return;
		}

		// add the entire market object
		var demands = [];
		var sentiments = [];
		for (var i = 0; i < data.length; i++) {
			demands.push(data[i].demand);
			sentiments.push(data[i].sentiment);
		}
		var entireMarketDemand = getAverageLine(demands);
		var entireMarketSentiment = getAverageLine(sentiments);

		var entireMarketItem = {};
		entireMarketItem.product = "entire market";
		entireMarketItem.demand = entireMarketDemand;
		entireMarketItem.sentiment = entireMarketSentiment;

		data.push(entireMarketItem);

		callback(null, data);
	});
}

// callback takes params (error, locations) where locations is an array of objects with fields: tweetId, latitude, longitude
var getDemandLocationsForProduct = function(product, dateLowerBound, callback) {
	database.getTweets( { product: product, demand: true, geo: true, sort: 'created_at', select: 'id geo', dateLowerBound: dateLowerBound }, function(error, tweets) {
		if (error) {
			callback(error);
			return;
		}

		var locations = [];
		_.each(tweets, function(tweet) {
			var location = {};
			location.tweetId = tweet.id;
			location.latitude = tweet.geo[0];
			location.longitude = tweet.geo[1];
			locations.push(location);
		});

		callback(null, locations);
	});
}

// callback takes params (error, locations) where locations is an array of objects with fields: tweetId, latitude, longitude, sentiment
var getSentimentLocationsForProduct = function(product, dateLowerBound, callback) {
	database.getTweets( { product: product, demand: false, geo: true, sort: 'created_at', select: 'id geo text', dateLowerBound: dateLowerBound }, function(error, tweets) {
		if (error) {
			callback(error);
			return;
		}

		var locations = [];
		_.each(tweets, function(tweet) {
			var location = {};
			location.tweetId = tweet.id;
			location.latitude = tweet.geo[0];
			location.longitude = tweet.geo[1];
			location.sentiment = sentiment(tweet.text).score;
			locations.push(location);
		});

		callback(null, locations);
	});
}

// callback takes params (error, data) where data is an array of objects with fields:
// product, demand, sentiment where each of demand, sentiment are arrays of locations with fields:
// tweetId, latitude, longitude and scale for sentiment
var getLocationsForCategory = function(category, dateLowerBound, callback) {
	var products = getProductsForCategory(category);
	var data = [];

	var entireMarketItem = {};
	entireMarketItem.product = "entire market";
	entireMarketItem.demand = [];
	entireMarketItem.sentiment = [];

	async.each(products, function(product, callback) {
		var item = {};
		item.product = product;

		var getDemand = function(callback) {
			getDemandLocationsForProduct(product, dateLowerBound, function(error, locations) {
				if (error) {
					callback(error);
					return;
				}

				item.demand = locations;
				entireMarketItem.demand = entireMarketItem.demand.concat(locations);
				callback();
			});
		}

		var getSentiment = function(callback) {
			getSentimentLocationsForProduct(product, dateLowerBound, function(error, locations) {
				if (error) {
					callback(error);
					return;
				}

				item.sentiment = locations;
				entireMarketItem.sentiment = entireMarketItem.sentiment.concat(locations);
				callback();
			});
		}

		async.parallel([getDemand, getSentiment], function(error) {
			if (error) {
				callback(error);
				return;
			}

			data.push(item);
			callback();
		});

	}, function(error) {
		if (error) {
			callback(error);
			return;
		}

		// scale the sentiment values to be between -1 and 1
		var locationWithMaxSentiment = _.max(entireMarketItem.sentiment, function(location) { return location.sentiment; });
		var locationWithMinSentiment = _.min(entireMarketItem.sentiment, function(location) { return location.sentiment; });
		var maxSentiment = locationWithMaxSentiment.sentiment;
		var minSentiment = locationWithMinSentiment.sentiment;

		var scaleFactor = Math.max(maxSentiment, Math.abs(minSentiment));

		_.each(data, function(item) {
			_.each(item.sentiment, function(location) {
				location.sentiment /= scaleFactor;
			});
		});

		// entireMarketItem shares references with the other items in the data array
		// so its sentiment values are already scaled
		data.push(entireMarketItem);
		callback(null, data);
	});
}

// callback takes params: error, words, where words is an array of 2d arrays [text, size]
var getWordCloudForProduct = function(product, dateLowerBound, callback) {
	database.getTweets( { product: product, select: 'text', dateLowerBound: dateLowerBound }, function(error, tweets) {
		if (error) {
			callback(error);
			return;
		}

		var index = countWordsInTweets(tweets);
		var minimumWordCount = Math.floor(tweets.length / 10);
		var minimumWordLength = 4;
		var words = [];
		_.each(_.keys(index), function(key) {
			var word = {};
			word.text = key;
			word.size = index[key];
			if (word.size >= minimumWordCount && word.text.length >= minimumWordLength) {
				words.push(word);
			}
		});
		words = _.sortBy(words, 'size');
		callback(null, words);
	});
}

// callback takes params: error, data, where data is an array of objects with fields:
// product, words, and words is an array of objects with fields: text, size
var getWordCloudForCategory = function(category, dateLowerBound, callback) {
	var products = getProductsForCategory(category);
	var data = [];

	var entireMarketItem = {};
	entireMarketItem.product = "entire market";
	entireMarketItem.words = [];

	async.each(products, function(product, callback) {
		var item = {};
		item.product = product;
		data.push(item);

		getWordCloudForProduct(product, dateLowerBound, function(error, words) {
			if (error) {
				callback(error);
				return;
			}

			item.words = words;
			entireMarketItem.words = entireMarketItem.words.concat(words);

			callback();
		});

	}, function(error) {
		if (error) {
			callback(error);
			return;
		}

		callback(null, data);
	});
}

// callback takes params: error, chart where chart is an array of 2d arrays [country, value]
var getDemandGeoChartForProduct = function(product, dateLowerBound, callback) {
	database.getTweets( { product: product, demand: true, countryCodeExists: true, select: 'country_code', dateLowerBound: dateLowerBound }, function(error, tweets) {
		if (error) {
			callback(error);
			return;
		}

		var index = getCountryCountForTweets(tweets);
		var chart = [];
		_.each(_.keys(index), function(key) {
			chart.push([key, index[key]]);
		});

		callback(null, chart);
	});
}

// callback takes params: error, chart, where chart is an array of 2d arrays [country, value]
var getSentimentGeoChartForProduct = function(product, dateLowerBound, callback) {
	database.getTweets( { product: product, demand: false, countryCodeExists: true, select: 'country_code text', dateLowerBound: dateLowerBound }, function(error, tweets) {
		if (error) {
			callback(error);
			return;
		}

		var index = getCountrySentimentForTweets(tweets);
		var chart = [];
		_.each(_.keys(index), function(key) {
			chart.push([key, index[key]]);
		});

		callback(null, chart);
	});
}

// callback takes params: error, data, where data is an array of objects with fields:
// product, demand, sentiment, where demand and sentiment are arrays of 2d arrays [country, value]
var getGeoChartForCategory = function(category, dateLowerBound, callback) {
	var products = getProductsForCategory(category);
	var data = [];

	var allDemandCharts = [];
	var allSentimentCharts = [];
	async.each(products, function(product, callback) {
		var item = {};
		item.product = product;

		var getDemand = function(callback) {
			getDemandGeoChartForProduct(product, dateLowerBound, function(error, chart) {
				if (error) {
					callback(error);
					return;
				}

				item.demand = chart;
				allDemandCharts.push(chart);
				callback();
			});
		}

		var getSentiment = function(callback) {
			getSentimentGeoChartForProduct(product, dateLowerBound, function(error, chart) {
				if (error) {
					callback(error);
					return;
				}

				item.sentiment = chart;
				allSentimentCharts.push(chart);
				callback();
			});
		}

		async.parallel([getDemand, getSentiment], function(error) {
			if (error) {
				callback(error);
				return;
			}

			data.push(item);
			callback();
		});

	}, function(error) {
		if (error) {
			callback(error);
			return;
		}

		var entireMarketItem = {};
		entireMarketItem.product = "entire market";
		entireMarketItem.demand = sumCountryCharts(allDemandCharts);
		entireMarketItem.sentiment = sumCountryCharts(allSentimentCharts);
		data.push(entireMarketItem);

		callback(null, data);
	});
}

// callback takes params error, tweet, where tweet is an object with fields:
// text, screen_name, created_at
var getTweet = function(tweetId, callback) {
	database.getTweet( { tweetId: tweetId, select: 'text user.screen_name created_at' }, function(error, tweet) {
		if (error) {
			callback(error);
			return;
		}

		if (!tweet) {
			callback("No tweet with that id");
			return;
		}

		var result = {};
		result.text = tweet.text;
		result.screen_name = tweet.user.screen_name;
		result.created_at = tweet.created_at;

		callback(null, result);
	});
}

module.exports.getGraphForCategory = getGraphForCategory;
module.exports.getLocationsForCategory = getLocationsForCategory;
module.exports.getCategories = getCategories;
module.exports.getWordCloudForCategory = getWordCloudForCategory;
module.exports.getTweet = getTweet;
module.exports.getGeoChartForCategory = getGeoChartForCategory;

