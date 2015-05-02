var mongoose = require('mongoose');

var BoundsSchema = mongoose.Schema({
	northWest: { type: mongoose.Schema.Types.ObjectId, ref: 'Point'},
	northEast: { type: mongoose.Schema.Types.ObjectId, ref: 'Point'},
	southEast: { type: mongoose.Schema.Types.ObjectId, ref: 'Point'},
	southWest: { type: mongoose.Schema.Types.ObjectId, ref: 'Point'}
});

mongoose.model('Bounds', BoundsSchema);