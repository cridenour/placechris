/* Functions relating to the generation of images */
	var fs = require('fs')
	, 	async = require('async')
	,	im = require('imagemagick');


exports.list = function(req, res) {

	async.waterfall([
		function(callback) {
			fs.readFile('./images.json', 'ascii', callback);
		},
		function(json, callback) {
			callback(null, eval(json))
		},
		function(images, callback) {
			res.render('list', {
				title: 'Image List',
				images: images
			});

			console.log(images)
		}
	],
	function(err, result) {
		console.log('Errored: ' + err)
	});
}

exports.generate = function(req, res) {


	var ratio = parseInt(req.params.width) / parseInt(req.params.height);


	res.render('generate', {
		title: 'Handsome!', 
		width: req.params.width, 
		height: req.params.height,
		ratio: ratio
	});

}