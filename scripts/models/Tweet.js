var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var TweetSchema = mongoose.Schema({
	id: { type: Number, index: true },
	created_at: { type: Date, index: true },
	text: String,
	source: String,
	truncated: Boolean,
	user: {
		id: Number,
		name: String,
		screen_name: String,
		location: String,
		url: String,
		description: String,
		protected: Boolean,
		verified: Boolean,
		followers_count: Number,
		friends_count: Number,
		listed_count: Number,
		favourites_count: Number,
		statuses_count: Number,
		created_at: Date,
		utc_offset: Number,
		time_zone: String,
		geo_enabled: Boolean,
		lang: String
	},
	geo: { type: [Number], index: '2d' },
	country: { type: String, index: true },
	country_code: { type: String, index: true },
	retweet_count: Number,
	favourite_count: Number,
	favorited: Boolean,
	retweeted: Boolean,
	possibly_sensitive: Boolean,
	lang: String,
	product: String,
	indicatesDemand: Boolean
});

TweetSchema.methods.getDescription = function() {
	return this.text;
}

TweetSchema.plugin(deepPopulate, null);

mongoose.model('Tweet', TweetSchema);