// Trend detection

var natural = require('natural') // for stemming

function getFrequencyTable(tweet){
	var tweetLowered = tweet.toLowerCase()
	var tweetWords = tweetLowered.split(/\s+/)

	var count = {}

	for(var i = 0; i < tweetWords.length; i++){
		var word = tweetWords[i].replace(/[^#@a-zA-Z0-9_-]/, '')

		var stem = natural.LancasterStemmer.stem(word)

		if(count[stem])
			count[stem].count++
		else
			count[stem] = {repr: word, count: 1}
	}

	return count
}

function mergeFrequencyTables(a, b){
	var result = {}
	
	for(var key in a){
		result[key] = a[key]
	}

	for(var key in b){
		if(result[key])
			result[key].count += b[key].count
		else
			result[key] = b[key]
	}

	return result
}

function getFrequencyTableForMany(tweets){
	var result = {}
	for(var i = 0; i < tweets.length; i++){
		result = mergeFrequencyTables(result, getFrequencyTable(tweets[i]))
	}
	return result
}

function simpleTrendDetectionAgainst(tweet, freqTable){
	// TODO
}

var tweets = ["Today starts with a Good morning #happy", "Today's show was quite a disappointment", "Did you see my new book?",
			  "I want to thank all my fans -- without you I would
			   have never been able to achieve anything #loveyou"]

var ft = getFrequencyTableForMany(tweets)

console.log(ft)