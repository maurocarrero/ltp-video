var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin",
		"http://localhost:8000");
	res.header("Access-Control-Allow-Methods",
		"GET, POST, OPTIONS");
	res.header("Access-Control-Allow-Headers",
		"Access-Control-Allow-Origin, Content-Type, Accept");
	next();
});

app.post('/api/images', function (req, res) {
	persistData(req.body);
	res.send('OK');
});

function persistData(imageData) {
	var imageBuffer = decodeBase64Image(imageData.img);
	var uploadsFolder = 'server/uploads/';
	var fileName = 'image' + (new Date()).getTime();
	var fileExtension = '.' + (imageData.type || 'png');

	fs.writeFile(uploadsFolder + fileName + fileExtension,
		imageBuffer.data, function (err) {
			if (err) {
				console.log('ERROR', err);
			} else {
				console.log('OK: ', fileName + fileExtension);
			}
		});
}

function decodeBase64Image(base64Data) {
	var matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};

	if (matches && matches.length !== 3) {
		return new Error('Invalid input string');
	}

	response.type = (matches && matches[1]) || 'img/png';
	response.data = new Buffer((matches && matches[2]) || base64Data, 'base64');

	return response;
}

app.listen(3000);
console.log('API on port 3000', '\nThis server is meant to save the pictures taken.');

