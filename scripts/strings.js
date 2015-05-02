var _ = require('underscore')._;

var prefixes = ["bought", "got", "want", "need"];
var vowels = ["a", "e", "i", "o", "u"];

var getSearchStringsForProduct = function(product) {
	var searchStrings = [];

	_.each(prefixes, function(prefix) {
		var searchString = prefix + " " + product;
		searchStrings.push(searchString);
	});

	return searchStrings;
}

module.exports.getSearchStringsForProduct = getSearchStringsForProduct;