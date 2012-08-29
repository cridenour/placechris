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

	var renderedFileName = '/mnt/data/tmp/' + req.params.width + 'x' + req.params.height + '.jpg';
	var ratio = parseInt(req.params.width) / parseInt(req.params.height);

	async.waterfall([
		function(callback) {
			// Check our cache
			if(fs.existsSync(renderedFileName)) {
				var stats = fs.statSync(renderedFileName)
				now = new Date()

				// Re-render anyways (if its been a day)
				if(now.getTime() - stats.ctime.getTime() > 86400000)
					callback(null, null)
				else
					callback(null, renderedFileName)
			} else {
				callback(null, null);
			}
		},
		function(cacheFile, callback) {
			if(cacheFile !== null) {
				var img = fs.readFileSync(cacheFile)
				res.writeHead(200, {'Content-Type': 'image/jpeg'})
				res.end(img, 'binary')
			} else {
				console.log('No cache or expired cache. Regenerating.')
				fs.readFile('./images.json', 'ascii', callback);
			}
		},
		function(json, callback) {
			callback(null, eval(json))
		},
		function(images, callback) {
			acceptable = false

			i = Math.floor(Math.random() * images.length);
			size = ""

			// Come up with a size based on ratio
			if(ratio < 0.75) 
				size = "tall"
			else if (ratio > 1.25)
				size = "wide"
			else
				size="square"

			console.log("We need a " + size + " image.")

			// Loop through until we find an acceptable images
			while(!acceptable) {
				selectedImage = clone(images[i]);
				
				// Compare size

				if(selectedImage['height'] > req.params.height && selectedImage['width'] > req.params.width && selectedImage['sizes'].toString().indexOf(size) != -1) {
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
			// Find our limiting parameter
			var selectedRatio = selectedImage['width'] / selectedImage['height'];

			if (selectedRatio * req.params.height < req.params.width)
				var resizeParams = req.params.width + 'x'
			else
				var resizeParams = 'x' + req.params.height


			im.convert([selectedImage['filename'], '-resize', resizeParams, '-gravity', 'center', '-crop', req.params.width + 'x' + req.params.height + '+0+0', '+repage', renderedFileName], callback);


		},
		function(stdout, stderr, callback) {
			var img = fs.readFileSync(renderedFileName)
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
