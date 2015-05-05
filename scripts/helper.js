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
	var day = new Date();
	day.setDate(day.getDate() - days);
	return day;
}

module.exports.getRandomSample = getRandomSample;
module.exports.today = today;
module.exports.daysAgo = daysAgo;