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

		}
	],
	function(err, result) {
		console.log('Errored: ' + err)
	});
}

exports.generate = function(req, res) {

	async.waterfall([
		function(callback) {
			fs.readFile('./images.json', 'ascii', callback);
		},
		function(json, callback) {
			callback(null, eval(json))
		},
		function(images, callback) {
			acceptable = false

			i = Math.floor(Math.random() * images.length);
			// Loop through until we find an acceptable images
			while(!acceptable) {
				selectedImage = clone(images[i]);
				if(selectedImage['height'] > req.params.height && selectedImage['width'] > req.params.width) {
					acceptable = true
				}
				else {
					i = Math.floor(Math.random() * images.length);
					selectedImage = clone(images[i])
				}
			}
			callback(null, selectedImage);
		},
		function(selectedImage, callback) {
			var ratio = parseInt(req.params.width) / parseInt(req.params.height);
			var selectedRatio = selectedImage['width'] / selectedImage['height'];

			if (selectedRatio < 1 || ratio > 1) { 
		 		var resizeParams = req.params.width
			} else {
					var resizeParams = 'x' + req.params.height
			}

			im.convert([selectedImage['filename'], '-resize', resizeParams, '-gravity', 'center', '-crop', req.params.width + 'x' + req.params.height + '+0+0', '+repage', './cache/tmp.jpg'], callback);


		},
		function(stdout, stderr, callback) {
			var img = fs.readFileSync('./cache/tmp.jpg')
			res.writeHead(200, {'Content-Type': 'image/jpeg'})
			res.end(img, 'binary')
		}
	],
	function(err, result) {
		console.log('Errored: ' + err)
	});

}

function clone(obj) {
  var copy = {};
  for (var attr in obj) {
   if (obj.hasOwnProperty(attr)) {
     copy[attr] = obj[attr];
   }
  }
  return copy;
}