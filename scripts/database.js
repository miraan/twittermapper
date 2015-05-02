var async = require('async');
var mongoose = require('mongoose');
require('./models/Bounds');
require('./models/Point');
require('./models/Tweet');
require('./models/TwitterUser');

var Bounds = mongoose.model('Bounds');
var Point = mongoose.model('Point');
var Tweet = mongoose.model('Tweet');
var TwitterUser = mongoose.model('TwitterUser');

var saveTweet = function(tweetJson, callback) {
	var point;
	var bounds;
	var twitterUser;
	var tweet;

	var savePointObject = function(callback) {
		if (!tweetJson.geo) {
			callback(null);
			return;
		}

		point = new Point({
			latitude: tweetJson.geo.coordinates[0],
			longitude: tweetJson.geo.coordinates[1]
		});

		point.save(function(error, point) {
			if (error) {
				callback(error);
				return;

			}
			
			callback(null);
		});
	}

	var saveBoundsObject = function(callback) {
		if (!tweetJson.place || !tweetJson.place.bounding_box) {
			callback(null);
			return;
		}

		var southWestPoint = new Point({
			latitude: tweetJson.place.bounding_box.coordinates[0][0][1],
			longitude: tweetJson.place.bounding_box.coordinates[0][0][0]
		});

		var northWestPoint = new Point({
			latitude: tweetJson.place.bounding_box.coordinates[0][1][1],
			longitude: tweetJson.place.bounding_box.coordinates[0][1][0]
		});

		var northEastPoint = new Point({
			latitude: tweetJson.place.bounding_box.coordinates[0][2][1],
			longitude: tweetJson.place.bounding_box.coordinates[0][2][0]
		});

		var southEastPoint = new Point({
			latitude: tweetJson.place.bounding_box.coordinates[0][3][1],
			longitude: tweetJson.place.bounding_box.coordinates[0][3][0]
		});

		var points = [southWestPoint, northWestPoint, northEastPoint, southEastPoint];

		async.each(points, function(currentPoint, asyncCallback) {
			currentPoint.save(function(error, currentPoint) {
				if (error) {
					asyncCallback(error);
					return;
				}
				
				asyncCallback();
			});

		}, function(error) {
			if (error) {
				callback(error);
				return;
			}

			bounds = new Bounds({
				points: [southWestPoint, northWestPoint, northEastPoint, southEastPoint]
			});

			bounds.save(function(error, bounds) {
				if (error) {
					callback(error);
					return;

				}

				callback(null);
			});

		});
	}

	var saveTwitterUserObject = function(callback) {
		twitterUser = new TwitterUser({
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
		});

		twitterUser.save(function(error, twitterUser) {
			if (error) {
				callback(error);
				return;

			}
			
			callback(null);
		});
	}

	var saveTweetObject = function(callback) {
		tweet = new Tweet({
			id: tweetJson.id,
			created_at: new Date(tweetJson.created_at),
			text: tweetJson.text,
			source: tweetJson.source,
			truncated: tweetJson.truncated,
			user: twitterUser,
			point: point,
			bounds: bounds,
			retweet_count: tweetJson.retweet_count,
			favourite_count: tweetJson.favorite_count,
			favorited: tweetJson.favorited,
			retweeted: tweetJson.retweeted,
			possible_sensitive: tweetJson.possible_sensitive,
			lang: tweetJson.lang,
			searchText: tweetJson.searchText
		});

		tweet.save(function(error, tweet) {
			if (error) {
				callback(error);
				return;

			}
			
			callback(null);
		});
	}

	async.series([
		savePointObject,
		saveBoundsObject,
		saveTwitterUserObject,
		saveTweetObject
		],

		function(error) {
			if (error) {
				callback(error, null);
				return;
			}

			callback(null, tweet);
		});
}

var getTweets = function(callback) {
	Tweet.find().populate('user point bounds').exec(function(error, tweets) {
		if (error) {
			callback(error, null);
			return;

		}

		callback(null, tweets);
	})
}

var wipeDatabase = function(callback) {
	var models = [Bounds, Point, Tweet, TwitterUser];

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

	// wipeDatabase(function(error) {
	// 	if (error) {
	// 		console.log("Error wiping database");
	// 		return;
	// 	}

	// 	console.log("Wiped database successfully");
	// });
	
});

module.exports.saveTweet = saveTweet;
module.exports.getTweets = getTweets;
module.exports.wipeDatabase = wipeDatabase;

