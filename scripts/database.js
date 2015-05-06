var async = require('async');
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');
var _ = require('underscore')._;
require('./models/Tweet');

var Tweet = mongoose.model('Tweet');

// callback has params error, tweet
var saveTweet = function(tweetJson, callback) {
	var point;
	var twitterUser;
	var tweet;
	var country;
	var country_code;

	var makePoint = function() {
		if (!tweetJson.geo) {
			return;
		}

		if (tweetJson.geo.coordinates[0] != 0 || tweetJson.geo.coordinates[1] != 0) {
			point = [
				tweetJson.geo.coordinates[0],
				tweetJson.geo.coordinates[1]
			];
			return;
		}

		// we have 0,0 returned from twitter. use the bounding box coordinates instead, lat lng are reversed
		var southWest = tweetJson.place.bounding_box.coordinates[0][0];
		var northWest = tweetJson.place.bounding_box.coordinates[0][1];
		var northEast = tweetJson.place.bounding_box.coordinates[0][2];
		var southEast = tweetJson.place.bounding_box.coordinates[0][3];

		var lat = (southWest[1] + southEast[1]) / 2;
		var lng = (southWest[0] + northWest[0]) / 2;
		point = [lat, lng];
	};

	var makeCountry = function() {
		if (tweetJson.place) {
			if (tweetJson.place.country) {
				country = tweetJson.place.country;
			}
			if (tweetJson.place.country_code) {
				country_code = tweetJson.place.country_code;
			}
		}
	}

	var makeTwitterUser = function() {
		twitterUser = {
			id: tweetJson.user.id,
			name: tweetJson.user.name,
			screen_name: tweetJson.user.screen_name,
			location: tweetJson.user.location,
			url: tweetJson.user.url,
			description: tweetJson.user.description,
			protected: tweetJson.user.protected,
			verified: tweetJson.user.verified,
			followers_count: tweetJson.user.followers_count,
			friends_count: tweetJson.user.friends_count,
			listed_count: tweetJson.user.listed_count,
			favourites_count: tweetJson.user.favourites_count,
			statuses_count: tweetJson.user.statuses_count,
			created_at: new Date(tweetJson.user.created_at),
			utc_offset: tweetJson.user.utc_offset,
			time_zone: tweetJson.user.time_zone,
			geo_enabled: tweetJson.user.geo_enabled,
			lang: tweetJson.user.lang
		};
	};

	var makeTweet = function() {
		tweet = new Tweet({
			id: tweetJson.id,
			created_at: new Date(tweetJson.created_at),
			text: tweetJson.text,
			source: tweetJson.source,
			truncated: tweetJson.truncated,
			user: twitterUser,
			geo: point,
			country: country,
			country_code: country_code,
			retweet_count: tweetJson.retweet_count,
			favourite_count: tweetJson.favorite_count,
			favorited: tweetJson.favorited,
			retweeted: tweetJson.retweeted,
			possible_sensitive: tweetJson.possible_sensitive,
			lang: tweetJson.lang,
			product: tweetJson.product,
			indicatesDemand: tweetJson.indicatesDemand
		});
	};

	makePoint();
	makeCountry();
	makeTwitterUser();
	makeTweet();

	tweet.save(function(error, savedTweet) {
		if (error) {
			callback(error, null);
			return;
		}

		callback(null, savedTweet);
	});
}

// callback takes params error, tweets
var getTweets = function(options, callback) {
	var query = Tweet.find();

	if (options.product) {
		query = query.where('product').equals(options.product);
	}
	if (options.products) {
		query = query.where('product').in(options.products);
	}
	if (options.demand) {
		query = query.where('indicatesDemand').equals(options.demand);
	}
	if (options.geo) {
		query = query.exists('geo');
	}
	if (options.sort) {
		query = query.sort(options.sort);
	}
	if (options.dateLowerBound) {
		query = query.where('created_at').gte(options.dateLowerBound);
	}
	if (options.limit) {
		query = query.limit(options.limit);
	}
	if (options.excludedProducts) {
		_.each(options.excludedProducts, function(excludedProduct) {
			query = query.where('product').ne(excludedProduct);
		});
	}
	if (options.select) {
		query = query.select(options.select);
	}
	if (options.country) {
		query = query.where('country').equals(options.country);
	}
	if (options.countryExists) {
		query = query.exists('country');
	}
	if (options.country_code) {
		query = query.where('country_code').equals(options.country_code);
	}
	if (options.countryCodeExists) {
		query = query.exists('country_code');
	}

	query.exec(function(error, tweets) {
		if (error) {
			callback(error, null);
			return;

		}

		callback(null, tweets);
	})
}

// callback takes params: error, tweet
var getTweet = function(options, callback) {
	var query = Tweet.findOne();

	if (options.tweetId) {
		query = query.where('id').equals(options.tweetId);
	}
	if (options.product) {
		query = query.where('product').equals(options.product);
	}
	if (options.products) {
		query = query.where('product').in(options.products);
	}
	if (options.demand) {
		query = query.where('indicatesDemand').equals(options.demand);
	}
	if (options.geo) {
		query = query.exists('geo');
	}
	if (options.sort) {
		query = query.sort(options.sort);
	}
	if (options.dateLowerBound) {
		query = query.where('created_at').gte(options.dateLowerBound);
	}
	if (options.limit) {
		query = query.limit(options.limit);
	}
	if (options.excludedProducts) {
		_.each(options.excludedProducts, function(excludedProduct) {
			query = query.where('product').ne(excludedProduct);
		});
	}
	if (options.select) {
		query = query.select(options.select);
	}

	query.exec(function(error, tweet) {
		if (error) {
			callback(error, null);
			return;

		}

		callback(null, tweet);
	})
}

var wipeDatabase = function(callback) {
	var models = [Tweet];

	var dropModel = function(model, dropModelCallback) {
		console.log("Dropping ", model.modelName);
		var i = new model();
		i.collection.drop(function(error) {
			if (error) {
				// ignore the error
				dropModelCallback();
				return;
			}

			dropModelCallback();
		});
	};

	async.forEachSeries(models, dropModel, function(error) {
		if (error) {
			callback(error);
			return;

		}

		callback(null);
	});
}

mongoose.connect('mongodb://localhost/twittermapper');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	console.log("Connected to MongoDB");
});

module.exports.saveTweet = saveTweet;
module.exports.getTweets = getTweets;
module.exports.getTweet = getTweet;
module.exports.wipeDatabase = wipeDatabase;

