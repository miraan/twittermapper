var express = require('express');
var router = express.Router();
var async = require('async');
var analysis = require('../scripts/analysis');
var helper = require('../scripts/helper');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/getGraph/:category/:days', function(req, res, next) {
	var category = req.params.category;
	var days = req.params.days;

	var dateLowerBound = helper.daysAgo(days);
	var products = analysis.getProductsForCategory(category);

	var result = [];
	async.each(products, function(product, callback) {
		var item = {};
		item.product = product;

		var getDemand = function(callback) {
			analysis.getDemandGraph(product, dateLowerBound, function(error, points) {
				if (error) {
					callback(error);
					return;
				}

				item.demand = points;
				callback();
			});
		}

		var getSentiment = function(callback) {
			analysis.getSentimentGraph(product, dateLowerBound, function(error, points) {
				if (error) {
					callback(error);
					return;
				}

				item.sentiment = points;
				callback();
			});
		}

		async.parallel([getDemand, getSentiment], function(error) {
			if (error) {
				callback(error);
				return;
			}

			result.push(item);
			callback();
		});

	}, function(error) {
		if (error) {
			res.error(error);
			return;
		}

		res.json(result);
	});

});

module.exports = router;
