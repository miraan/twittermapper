var mongoose = require('mongoose');

var ProductSchema = mongoose.Schema({
	name: String
});

mongoose.model('Product', ProductSchema);