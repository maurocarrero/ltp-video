'use strict';

angular.module('ltpVideo.video.ltp-video.directive', [])

	.directive('ltpVideo', function ($http, $timeout) {
		return {
			restrict: 'E',
			templateUrl: 'components/ltp-video/video.html',
			link: function (scope) {
				var gUM = null;
				var lastShot = null;
				var video = document.querySelector('video');
				var canvas = document.querySelector('canvas');
				var images = document.querySelector('.images');
				var ctx = canvas.getContext('2d');
				var localMediaStream = null;
				var idx = 0;
				var shotWidth = 307;
				var shotHeight = 250;
				var videoResolution = {
					width: 1280,
					height: 720
				};

				/**
				 * @function hasGetUserMedia
				 * @description Checks if we have getUserMedia API in the navigator.
				 * Relies on Modernizr to do so.
				 * @returns {boolean}
				 */
				var hasGetUserMedia = function () {
					if (Modernizr) {
						console.log('What has Modernizr to say?: ', Modernizr.getusermedia);
						gUM = Modernizr.prefixed('getUserMedia', navigator);
					}
					gUM = navigator.mediaDevices && navigator.mediaDevices.getUserMedia || gUM;
					return gUM !== null;
				};

				/**
				 * @function errorCallback
				 * @description A helper to send an error message
				 */
				var errorCallback = function () {
					console.log('Todo mal'); // Google spanish translation ;)
				};

				/**
				 * @function sizeCanvas
				 * @description Adjust the canvas size from the video element size, once the video element had
				 * rendered, adding a 5 seconds timeout for this.
				 */
				var sizeCanvas = function () {
					// video.onloadedmetadata not firing in Chrome so we have to hack.
					// See crbug.com/110938.
					$timeout(function() {
						canvas.width = video.videoWidth;
						canvas.height = video.videoHeight;
					}, 5000);
				};

				/**
				 * @function init
				 * @description
				 */
				var init = function () {
					console.log('Initializing...');
					// Not showing vendor prefixes or code that works cross-browser.
					// navigator.getUserMedia
					// use getUserMedia to start the video streaming, specifying resolution.
					gUM({
						video: {
							mandatory: {
								minWidth: videoResolution.width,
								minHeight: videoResolution.height
							}
						}
					}, function (stream) {
						localMediaStream = stream;
						video.src = window.URL.createObjectURL(localMediaStream);
						sizeCanvas();
					}, errorCallback);
				};

				// Starting up only if getUserMedia API is present.
				if (hasGetUserMedia()) {
					console.log('Good to go!');
					init();
				} else {
					console.log('Failure: no getUserMedia!');
				}

				/**
				 * snapshot
				 * @method scope.snapshot
				 * @methodOf scope
				 * @description Take a snapshot with the camera.
				 * 1. Checks localMediaStream stream from gUM
				 * 2. Draws the image taken from the video in the canvas context.
				 * 3. Creates an IMG html element
				 */
				scope.snapshot = function () {
					if (localMediaStream) {
						ctx.drawImage(video, 0, 0);
						// "image/webp" works in Chrome.
						// Other browsers will fall back to image/png.
						var shot = document.createElement('img');
						shot.src = canvas.toDataURL('image/webp');
						shot.width = shotWidth;
						shot.height = shotHeight;
						angular.element(shot).addClass('img-rounded');
						images.appendChild(shot);
						lastShot = shot;
					}
				};

				scope.sendPic = function () {
					scope.snapshot();
					ctx.drawImage(lastShot, 0, 0);
					var imageData = canvas.toDataURL('image/png');

					imageData = imageData.replace(/^data:image\/(png|jpg);base64,/, '');

					var data = JSON.stringify({
						img: imageData
					});

					$http({
						method: 'POST',
						url: 'http://localhost:3000/api/images',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': 'http://localhost:8000'
						},
						data: data
					}, function (response) {
						console.log(response);
						scope.snapshot();
					});
				};

				scope.filters = ['grayscale', 'sepia', 'blur', 'brightness',
					'contrast', 'hue-rotate', 'hue-rotate2',
					'hue-rotate3', 'saturate', 'invert', ''];

				scope.randomFilter = function () {
					var effect = scope.filters[idx++ % scope.filters.length]; // loop through filters.
					if (effect) {
						scope.appliedFilter = effect;
						scope.changeFilter();
					}
				};

				scope.changeFilter = function () {
					video.className = '';
					video.classList.add(scope.appliedFilter);
				};

				scope.recordAudio = function () {
					window.AudioContext = window.AudioContext ||
						window.webkitAudioContext;

					var context = new AudioContext();

					navigator.getUserMedia({ audio: true }, function (stream) {
						var microphone = context.createMediaStreamSource(stream);
						var filter = context.createBiquadFilter();

						// microphone -> filter -> destination.
						microphone.connect(filter);
						filter.connect(context.destination);
					}, errorCallback);
				};
			}
		};
	});
