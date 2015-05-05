var async = require('async');
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');
require('./models/Tweet');

var Tweet = mongoose.model('Tweet');

// callback has params error, tweet
var saveTweet = function(tweetJson, callback) {
	var point;
	var southWestPoint;
	var northWestPoint;
	var northEastPoint;
	var southEastPoint;
	var twitterUser;
	var tweet;

	var makePoint = function() {
		if (!tweetJson.geo) {
			return;
		}

		point = [
			tweetJson.geo.coordinates[0],
			tweetJson.geo.coordinates[1]
		];
	};

	var makeBoundsPoints = function() {
		if (!tweetJson.place || !tweetJson.place.bounding_box) {
			return;
		}

		southWestPoint = [tweetJson.place.bounding_box.coordinates[0][0][1], tweetJson.place.bounding_box.coordinates[0][0][0]];
		northWestPoint = [tweetJson.place.bounding_box.coordinates[0][1][1], tweetJson.place.bounding_box.coordinates[0][1][0]];
		northEastPoint = [tweetJson.place.bounding_box.coordinates[0][2][1], tweetJson.place.bounding_box.coordinates[0][2][0]];
		southEastPoint = [tweetJson.place.bounding_box.coordinates[0][3][1], tweetJson.place.bounding_box.coordinates[0][3][0]];
	};

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
			bounds: [],
			retweet_count: tweetJson.retweet_count,
			favourite_count: tweetJson.favorite_count,
			favorited: tweetJson.favorited,
			retweeted: tweetJson.retweeted,
			possible_sensitive: tweetJson.possible_sensitive,
			lang: tweetJson.lang,
			product: tweetJson.product,
			indicatesDemand: tweetJson.indicatesDemand
		});

		tweet.bounds[0] = southWestPoint;
		tweet.bounds[1] = northWestPoint;
		tweet.bounds[2] = northEastPoint;
		tweet.bounds[3] = southEastPoint;
	};

	makePoint();
	makeBoundsPoints();
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

	query.exec(function(error, tweets) {
		if (error) {
			callback(error, null);
			return;

		}

		callback(null, tweets);
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
module.exports.wipeDatabase = wipeDatabase;

