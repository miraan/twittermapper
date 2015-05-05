var _ = require('underscore')._;

var prefixes = ["bought", "got"];

var getSearchStringsForProduct = function(productName) {
	var searchStrings = [];

	_.each(prefixes, function(prefix) {
		var searchString = prefix + " " + productName;
		searchStrings.push(searchString);
	});

	return searchStrings;
}

module.exports.getSearchStringsForProduct = getSearchStringsForProduct;