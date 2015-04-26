var express = require('express');
var sentiment = require('sentiment');
var Twitter = require('twitter-js-client').Twitter;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var r1 = sentiment('Cats are the shit.');
console.dir(r1);

router.get('/markers', function(req, res, next) {
	res.json([]);
})

module.exports = router;
