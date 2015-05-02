var mongoose = require('mongoose');

var TweetSchema = mongoose.Schema({
	id: Number,
	created_at: Date,
	text: String,
	source: String,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'TwitterUser'},
	point: { type: mongoose.Schema.Types.ObjectId, ref: 'Point' },
	bounds: { type: mongoose.Schema.Types.ObjectId, ref: 'Bounds' },
	retweet_count: Number,
	favourite_count: Number,
	favorited: Boolean,
	retweeted: Boolean,
	possibly_sensitive: Boolean,
	lang: String
});

TweetSchema.methods.getDescription = function() {
	return this.text;
}

mongoose.model('Tweet', TweetSchema);