// Helper functions

/*
 * Splits text into word tokens and 
 */
function splitToTokens(text, threshold){
	text = text.replace(/:-?\)/, ' smile ')
	text = text.replace(/:-?\(/, ' frown ')
	text = text.replace(/:-?D/, ' lol ')
	text = text.replace(/<3+/, ' love ')
	text = text.replace(/!+/, ' withconviction ')
	text = text.replace(/\?+/, ' withuncertainty ')

	var initialWords = text.replace('n\'t', ' not').split(/\b/)

	initialWords = initialWords.map(function(s){
		return s.replace(/\s+/, '')
	}).filter(function(s){return s.length > 0 })

	// Mentions and hashtags get split into two tokens by the regex
	// bring them back to one unit
	var words = []

	for(var i = 0; i < initialWords.length; i++){
		if((initialWords[i] == '#' || initialWords[i] == '@') && (i + 1 < initialWords.length)){
			words.push(initialWords[i] + initialWords[i + 1])
			i++
		}else{
			words.push(initialWords[i])
		}
	}

	var result = []

	for(var i = 0; i < words.length; i++){
		var word = words[i].toLowerCase().replace(/[.!?,;]+/, '')

		if(word.length > threshold)
			result.push(word)
		else if(word.length == 0) // it was all punctuation
			result.push(words[i])
	}

	return result
}

/*
 * Annotate nots
 */
function annotateNegations(tokens, re){
	if(!re){
		re = (/([,.!?;]|frown|smile|lol|love)/i)
	}

	var not = /(not|n't|never|no)\b/i

	var inNotState = false

	for(var i = 0; i < tokens.length; i++){
		if(tokens[i].match(not) && !inNotState){
			inNotState = true
		}else if(inNotState && tokens[i].match(re)){
			inNotState = false
		}else if(inNotState){
			tokens[i] = 'not-' + tokens[i]
		}
	}

	return tokens
}

/*
 * Returns a unigram lexicon
 */
function getUnigramLexicon(){
	// A lexicon, maybe move this outside?
	var rawDictionary = {
		// Positive
		'amazing': +3,
		'epic': +3,
		'good': +1.5,
		'fair': +1,
		'fine': +2,
		'cool': +2.5,
		'best': +5,
		'sweet': +2,
		'cute': +2,
		'nice': +2,
		'interesting': +2,
		'creative': +2,
		'incredible': +4,
		'wonderful': +4,
		'pleasant': +3,
		'joyful': +4,
		'happy': +3,
		'positive': +2,
		'optimistic': +2,
		'love': +4, 'loved': +4,
		'moral': +2,
		'ethical': 2,
		'like': 2, 'liked': 2,
		'enjoy': +4, 'enjoyed': +4,
		'lol': +3, 'smile': +3, 'rofl': +3, 'ha': +3,
		'haha': +3, 'hahaha': 3, 'ahaha': +3, 'lool': +3,

		// Grey area (I bet on those being overall positive)
		'sick': +0.5, 'wicked': +0.5,


		// Negative
		'terrible': -3,
		'shit': -3,
		'bad': -1.5,
		'suck': -3, 'sucked': -3, 'sucks': -3,
		'fuckin': -3, 'fucking': -3, 'fucked': -3,
		'frown': -3, 'sad': -3,
		'worst': -5,
		'horrible': -4
	};

	var dictionary = {}

	for(var key in rawDictionary){
		var val = rawDictionary[key]
		dictionary[key] = val
		dictionary['not-' + key] = (val < 0 ? 5 + val : -5 + val)
	}

	return dictionary
}

function getSentiment(tweet, binary){
	var tokens = splitToTokens(tweet, 2)
	tokens = annotateNegations(tokens)

	var lexicon = getUnigramLexicon()

	var sum = 0
	var total = 0

	var withConviction = false
	var withUncertainty = false

	for(var i = 0; i < tokens.length; i++){
		var token = tokens[i]

		if(lexicon[token]){
			total++
			if(!binary)
				sum += lexicon[token]
			else
				sum += (lexicon[token] < 0 ? -1 : +1)
		}else if(token == 'withuncertainty'){
			withUncertainty = true
		}else if(token == 'withconviction'){
			withConviction = true
		}
	}

	var score = (sum + 0.1) / (total + 0.1)

	if(withConviction && !withUncertainty){
		score *= 1.1
	}else if(withUncertainty && !withConviction){
		score *= 0.9
	}else if(withUncertainty && withConviction){
		score *= 0.9 // I am trying to capture !? here
	}

	// Normalize the score again
	if(!binary){
		if(score < -5) score = -5
		if(score > +5) score = +5
	}else{
		if(score < -1) score = -1
		if(score > +1) score = +1
	}

	return score
}

function getGroupSentiment(tweets){
	var pos = 0
	var neg = 0

	for(var i = 0; i < tweets.length; i++){
		var score = getSentiment(tweets[i], true)
		
		console.log("Score for <" + tweets[i] + "> is " + score)

		if(score > 0)
			pos++
		else if(score < 0)
			neg++
	}

	/*
	 * I measure the sentiment and return 
	 * what percentage of all tweets showed that sentiment
	 */
	var score = (pos - neg) / (pos + neg)

	if(score > 0)
		return pos / tweets.length
	else
		return neg / tweets.length
}

tweet = ["The movie was shit #avengers", "#avengers I found it cool", "#avengers @pesho The best movie ever!"]

console.log(getGroupSentiment(tweet, true))