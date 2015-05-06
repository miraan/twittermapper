/*
 * Takes a bunch of time sorted tweets
 *	and a period (given in seconds)
 *
 * and returns a moving average of the demand
 */

function segmentTweetsByPeriod(tweets, period){
	var left = 0
	var right = 0
	var startDate = tweets[0].created_at
	var result = []

	while(right < tweets.length){
		startDate = tweets[right].created_at
		left = right
		
		while(right < tweets.length && tweets[right].created_at.getTime() - 1000 * period <= startDate.getDate()){
			right++
		}
	
		result.push(tweets.slice(left, right))
	}

	return result
}

function analyzeDemandSimple(tweets){
	var inDemand = 0
	
	for(var i = 0 ; i < tweets.length ; i++){
		if(tweets[i].indicatesDemand)
			inDemand++
	}
	
	if(tweets.length == 0)
		return 0

	return inDemand / tweets.length
}

/*
 *
 */
function analyzeDemandByImpact(tweets){
	var sum = 0
	var wsum = 0

	for(var i = 0 ; i < tweets.length ; i++){
		if(tweets[i].indicatesDemand){
			var log = Math.log(1 + tweets[i].user.followers_count)
			sum += log
			wsum += log
		}else
			wsum += 1
	}

	return (sum + 1e-9) / (wsum + 1e-9)
}

/*
 * Prediction functions working on past demand data
 */

function predictNextDemandWAvg(demand){
	var n = demand.length

	var wsum = 0
	var sum = 0

	for(var i = 0; i < n; i++){
		var c = n - 1 - i // index in demand[]
		var w = 10 / i // kind of arbitrary but we could tune this
		wsum += w
		sum += w * demand[c].demand
	}

	return (sum + 1e-9) / (wsum + 1e-9)
}