var express = require('express');
var router = express.Router();
var async = require('async');
var analysis = require('../scripts/analysis');
var helper = require('../scripts/helper');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/getCategories', function(req, res, next) {
	res.json(analysis.getCategories());
});

router.get('/getGraph/:category/:days', function(req, res, next) {
	var category = req.params.category;
	var days = req.params.days;
	var dateLowerBound = helper.daysAgo(days);

	analysis.getGraphForCategory(category, dateLowerBound, function(error, graph) {
		if (error) {
			res.error(error);
			return;
		}

		res.json(graph);
	});
});

router.get('/getLocations/:category/:days', function(req, res, next) {
	var category = req.params.category;
	var days = req.params.days;
	var dateLowerBound = helper.daysAgo(days);

	analysis.getLocationsForCategory(category, dateLowerBound, function(error, locations) {
		if (error) {
			res.error(error);
			return;
		}

		res.json(locations);
	});
});

module.exports = router;
