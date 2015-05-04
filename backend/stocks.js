// Provides access to the stock market data

var yahooFinance = require('yahoo-finance')


/*
var apple = yahooFinance.historical({
  symbol: 'AAPL',
  from: '2014-01-01',
  to: '2014-12-31',
  period: 'w'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
}, function (err, quotes) {
  console.log(quotes)
});
*/

exports.YFAPI = yahooFinance