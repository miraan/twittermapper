var mongoose = require('mongoose');

var TwitterUserSchema = mongoose.Schema({
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
});

mongoose.model('TwitterUser', TwitterUserSchema);