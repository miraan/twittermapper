var mongoose = require('mongoose');

var BoundsSchema = mongoose.Schema({
	// in order of bottom left, top left, top right, bottom right
	southWestPoint: { type: mongoose.Schema.Types.ObjectId, ref: 'Point'},
	northWestPoint: { type: mongoose.Schema.Types.ObjectId, ref: 'Point'},
	northEastPoint: { type: mongoose.Schema.Types.ObjectId, ref: 'Point'},
	southEastPoint: { type: mongoose.Schema.Types.ObjectId, ref: 'Point'}
});

mongoose.model('Bounds', BoundsSchema);