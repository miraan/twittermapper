var getRandom = function(limit) {
	return Math.round(Math.random() * limit);
}

var getRandomSample = function(sampleSize, array) {
	if (array.length == 0) {
		return [];
	}
	var randomSample = [];
	var limit = array.length - 1;
	for (var i = 0; i < sampleSize; i++) {
		var randomIndex = getRandom(limit);
		randomSample.push(array[randomIndex]);
	}
	return randomSample;
}

var today = function() { return new Date(); }

var daysAgo = function(days) {
	// var day = new Date();
	var day = new Date("2015-05-12T01:29:05.000Z"); // we are using this instead of the above line since we've stopped downloading tweet data
	day.setDate(day.getDate() - days);
	return day;
}

module.exports.getRandomSample = getRandomSample;
module.exports.today = today;
module.exports.daysAgo = daysAgo;