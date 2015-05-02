var mongoose = require('mongoose');

var PointSchema = mongoose.Schema({
	latitude: Number,
	longitude: Number
});

mongoose.model('Point', PointSchema);