var _ = require('underscore')._;

var prefixes = ["bought", "got"];
var foodPrefixes = ["ate", "had", "went"];
var drinkPrefixes = ["drank", "had", "went"];

var getSearchStringsForProduct = function(productName, options) {
	var searchStrings = [];

	_.each(prefixes, function(prefix) {
		var searchString = prefix + " " + productName;
		searchStrings.push(searchString);
	});

	if (options) {
		if (options.type == 'food') {
			_.each(foodPrefixes, function(prefix) {
				var searchString = prefix + " " + productName;
				searchStrings.push(searchString);
			});
		}

		if (options.type == 'drink') {
			_.each(drinkPrefixes, function(prefix) {
				var searchString = prefix + " " + productName;
				searchStrings.push(searchString);
			});
		}
	}

	return searchStrings;
}

module.exports.getSearchStringsForProduct = getSearchStringsForProduct;