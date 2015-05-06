/*
 * Takes a bunch of time sorted tweets
 *	and a period (given in seconds)
 *
 * and returns a moving average of the demand
 */
function analyzeDemandSimple(tweets, period){
	var left = 0
	var right = 0
	var inDemand = 0
	var startDate = tweets[0].created_at
	var result = []

	while(right < tweets.length){
		startDate = tweets[right].created_at
		left = right
		inDemand = 0
		
		while(right < tweets.length && tweets[right].created_at.getTime() - 1000 * period <= startDate.getDate()){
			if(tweets[right].indicatesDemand)
				inDemand++
			right++
		}

		result.push({demand: inDemand / (right - left), total: right - left})
	}

	return result
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