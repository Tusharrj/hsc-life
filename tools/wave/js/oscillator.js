'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*------------------------------*\
|* Theremin Oscillator
\*------------------------------*/

/*
 *Tahmid Eshayat
 * NOTES:
 *
 * Pitch on the theremin is controlled by the pointers x position.
 * Amplitude is controlled by the pointers y position.
 * Mousedown or Touch to start the Oscillator. Toggle on/off with osc UI.
 * Must view in debug mode to use the Gyroscope. Toggle on/off with gyro UI.
 *
 **/

/*------------------------------*\
|* Utils / Constants
\*------------------------------*/

var FREQ_LOW = 32.7031956625748294; // C1 in Hz
var FREQ_HIGH = 1046.502261202394538; // C6 in Hz
var DPR = window.devicePixelRatio || 1;

function scaleBetween(value, newMin, newMax, oldMin, oldMax) {
    return (newMax - newMin) * (value - oldMin) / (oldMax - oldMin) + newMin;
}

/*------------------------------*\
|* UI Icons
\*------------------------------*/

var gyroOnIcon = '\n<svg version="1.1" width="40px" height="40px" x="0px" y="0px" viewBox="0 0 60 60">\n    <ellipse fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" rx="5.5" ry="18"/>\n    <ellipse fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" rx="18" ry="5.5"/>\n    <circle fill="#FFF" cx="30" cy="30" r="1"/>\n    <circle fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" r="25"/>\n</svg>';

var gyroOffIcon = '\n<svg version="1.1" width="40px" height="40px" x="0px" y="0px" viewBox="0 0 60 60">\n    <circle fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" r="25"/>\n    <line fill="none" stroke="#FFF" stroke-width="2" x1="19" y1="19" x2="41" y2="41"/>\n    <line fill="none" stroke="#FFF" stroke-width="2" x1="41" y1="19" x2="19" y2="41"/>\n</svg>';

var oscOn = '\n<svg version="1.1" width="40px" height="40px" x="0px" y="0px" viewBox="0 0 60 60">\n    <path fill="none" stroke="#FFF" stroke-width="2" d="M4,30c0.8,6,1.6,12,3.2,12c3.2,0,3.2-24,6.5-24c3.2,0,3.2,24,6.5,24c3.2,0,3.2-24,6.5-24c3.2,0,3.2,24,6.5,24 c3.2,0,3.2-24,6.5-24c3.2,0,3.2,24,6.5,24c3.3,0,3.3-24,6.5-24c1.6,0,2.4,6,3.3,12"/>\n    <polyline fill="none" stroke="#FFF" stroke-width="2" points="4,13.7 4,4 56,4 56,13.7 "/>\n    <polyline fill="none" stroke="#FFF" stroke-width="2" points="56,46.5 56,56 4,56 4,46.5 "/>\n</svg>';

var oscOff = '\n<svg version="1.1" width="40px" height="40px" x="0px" y="0px" viewBox="0 0 60 60">\n    <polyline fill="none" stroke="#FFF" stroke-width="2" points="4.8,13.7 4.8,4 56.8,4 56.8,13.7 "/>\n    <polyline fill="none" stroke="#FFF" stroke-width="2" points="56.8,46.5 56.8,56 4.8,56 4.8,46.5 "/>\n    <line fill="none" stroke="#FFF" stroke-width="2" x1="19" y1="19.8" x2="41" y2="41.8"/>\n    <line fill="none" stroke="#FFF" stroke-width="2" x1="41" y1="19.8" x2="19" y2="41.8"/>\n</svg>';

/*------------------------------*\
|* Theremin Class
\*------------------------------*/

var Theremin = function () {
    function Theremin(root) {
        var _this = this;

        _classCallCheck(this, Theremin);

        this.state = {
            isPlaying: false,
            userInteracting: false };

        this.handlerResize = function () {
            _this.setCanvasSize();
        };

        this.handleInteractStart = function (e) {
            e.stopPropagation();

            if (!_this.state.userInteracting) {
                _this.setState({
                    userInteracting: true
                });
            }

            if (_this.state.isPlaying) {
                _this.stop();
            } else {
                _this.play();
            }
        };

        this.handleInteractEnd = function () {
            _this.stop();
        };

        this.handlePlayButton = function (e) {
            e.stopPropagation();
            _this.state.isPlaying ? _this.stop() : _this.play();
        };

        this.handleGyroButton = function () {
            _this.setState({
                userInteracting: !_this.state.userInteracting
            });
        };

        this.handleGyro = function (data) {
            if (_this.state.userInteracting) return;

            _this.x = scaleBetween(data.do.gamma, 0, _this.w, -90, 90);
            _this.y = scaleBetween(data.do.beta, 0, _this.w, -45, 45);

            _this.updateOsc();
        };

        this.handleInteractMove = function (event, touch) {
            if (!_this.state.userInteracting) {
                _this.setState({
                    userInteracting: !_this.state.userInteracting
                });
            }

            if (event.targetTouches) {
                event.preventDefault();
                _this.x = event.targetTouches[0].clientX * DPR;
                _this.y = event.targetTouches[0].clientY * DPR;
            } else {
                _this.x = event.clientX * DPR;
                _this.y = event.clientY * DPR;
            }

            _this.updateOsc();
        };

        this.play = function () {
            if (_this.osc) {
                _this.osc.stop();
                _this.osc = null;
            }

            if (_this.gainTimeout) return; // wait for any fading gains

            _this.setState({
                isPlaying: true
            });

            _this.updateGain();

            // new osc
            _this.osc = _this.audioCtx.createOscillator();
            _this.setFreq();
            _this.osc.connect(_this.masterGainNode);
            _this.osc.start();

            return _this.osc;
        };

        this.stop = function () {
            _this.updateGain(0, function () {
                _this.setState({
                    isPlaying: false
                });
                _this.osc.stop();
                _this.osc = null;
            });
        };

        this.root = root;

        this.setupUI();
        this.renderDom();
        this.updateDom();

        this.x = window.innerWidth / 2 * DPR;
        this.y = window.innerWidth / 1.8 * DPR;
        this.w = window.innerWidth;
        this.h = window.innerHeight;

        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
        this.visualizer = new Visualizer(this);

        this.setupGyro();
        this.setCanvasSize();
        this.setupMasterGain();
        this.addListeners();
    }

    // flag for mouse or touch interaction

    Theremin.prototype.setState = function setState(nextState) {
        this.state = Object.assign({}, this.state, nextState);
        this.updateDom();
    };

    Theremin.prototype.setupUI = function setupUI() {
        this.canvas = document.createElement('canvas');
        this.playButton = document.createElement('button');
        this.playButton.className = 'play-btn';
        this.gyroButton = document.createElement('button');
        this.gyroButton.className = 'gyro-btn';
    };

    Theremin.prototype.setupGyro = function setupGyro() {
        var _this2 = this;

        // Gyro
        var gn = new GyroNorm();

        var args = {
            frequency: 50, // ( How often the object sends the values - milliseconds )
            gravityNormalized: true, // ( If the gravity related values to be normalized )
            orientationBase: GyroNorm.GAME,
            decimalCount: 3, // ( How many digits after the decimal point will there be in the return values )
            logger: null, // ( Function to be called to log messages from gyronorm.js )
            screenAdjusted: false };

        // ( If set to true it will return screen adjusted values. )
        gn.init(args).then(function () {
            gn.start(_this2.handleGyro);
        }).catch(function (e) {
            console.warn('Error: Device does not support DeviceOrientation or DeviceMotion is not supported by the browser or device');
        });
    };

    Theremin.prototype.addListeners = function addListeners() {
        var _this3 = this;

        ['mousedown', 'touchstart'].forEach(function (event) {
            _this3.canvas.addEventListener(event, _this3.handleInteractStart, false);
        });
        ['mouseup', 'touchend'].forEach(function (event) {
            _this3.canvas.addEventListener(event, _this3.handleInteractEnd, false);
        });
        ['mousemove', 'touchmove'].forEach(function (event, touch) {
            _this3.canvas.addEventListener(event, _this3.handleInteractMove, false);
        });

        window.addEventListener('resize', this.handlerResize, false);
        this.playButton.addEventListener('click', this.handlePlayButton, false);
        this.gyroButton.addEventListener('click', this.handleGyroButton, false);
    };

    Theremin.prototype.setupMasterGain = function setupMasterGain() {
        console.log('master gain setup');
        this.masterGainNode = this.audioCtx.createGain();
        this.masterGainNode.connect(this.audioCtx.destination);
        this.masterGainNode.gain.value = 0;
    };

    Theremin.prototype.setGain = function setGain(value) {
        // cancel any future value
        var currentTime = this.audioCtx.currentTime;
        this.masterGainNode.gain.cancelScheduledValues(currentTime);
        this.masterGainNode.gain.value = value;
    };

    Theremin.prototype.updateGain = function updateGain(nextGain, cb) {
        var _this4 = this;

        if (typeof nextGain === "undefined") {
            nextGain = scaleBetween(this.y, 0, 1, 0, this.h);
        }

        var rampTime = 0.1;
        var prevGain = this.masterGainNode.gain.value;
        var currentTime = this.audioCtx.currentTime;
        var endTime = currentTime + rampTime;
        this.masterGainNode.gain.cancelScheduledValues(currentTime);
        this.masterGainNode.gain.setValueAtTime(prevGain, currentTime);
        this.masterGainNode.gain.linearRampToValueAtTime(nextGain, endTime);

        // probably a nicer way to do this without callback nonsense...
        if (typeof cb === 'function') {
            if (this.gainTimeout) {
                clearTimeout(this.gainTimeout);
            }
            this.gainTimeout = setTimeout(function () {
                _this4.gainTimeout = null;
                cb();
            }, rampTime * 1000);
        }
    };

    Theremin.prototype.setFreq = function setFreq() {
        var frequency = scaleBetween(this.x, FREQ_LOW, FREQ_HIGH, 0, this.w);
        this.osc.frequency.value = frequency;
    };

    Theremin.prototype.setCanvasSize = function setCanvasSize() {
        this.w = window.innerWidth * DPR;
        this.h = window.innerHeight * DPR;

        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    };

    // Interaction and Event Handlers

    // Audio Playback

    Theremin.prototype.updateOsc = function updateOsc() {
        if (this.osc && !this.gainTimeout) {
            this.updateGain();
            this.setFreq();
        }
    };

    // DOM View

    Theremin.prototype.renderDom = function renderDom() {
        this.root.appendChild(this.canvas);
        this.root.appendChild(this.playButton);
        this.root.appendChild(this.gyroButton);
    };

    Theremin.prototype.updateDom = function updateDom() {
        this.playButton.innerHTML = this.state.isPlaying ? oscOff : oscOn;
        this.gyroButton.innerHTML = this.state.userInteracting ? gyroOnIcon : gyroOffIcon;
    };

    return Theremin;
}();

/*------------------------------*\
|* Visualizer
\*------------------------------*/

var Visualizer = function () {
    function Visualizer(theremin) {
        var _this5 = this;

        _classCallCheck(this, Visualizer);

        this.draw = function () {
            _this5.drawBackground();
            _this5.drawOsc();
            _this5.drawText();
            _this5.drawPoint();

            ++_this5.tick;

            window.requestAnimationFrame(_this5.draw);
        };

        this.theremin = theremin;
        this.ctx = this.theremin.canvas.getContext('2d');
        this.ctx.scale(DPR, DPR);
        this.tick = 0;

        this.draw();
    }

    Visualizer.prototype.drawOsc = function drawOsc() {
        var xAxis = this.theremin.h / 2;

        this.ctx.beginPath();
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = 2 * DPR;
        this.ctx.strokeStyle = '#222';
        this.ctx.moveTo(0, xAxis);

        // Draw Oscillator or flat line
        if (this.theremin.osc) {
            var phase = this.tick * Math.PI / 180 * this.theremin.w / 8;

            var amplitude = this.theremin.masterGainNode.gain.value * this.theremin.h / 4;
            var frequency = this.theremin.osc.frequency.value / this.theremin.w * this.theremin.w / 10;

            var step = 1;
            var c = this.theremin.w / Math.PI / (frequency * 2);

            for (var i = 0; i < this.theremin.w; i += step) {
                var y = amplitude * Math.sin(i / c + phase);
                this.ctx.lineTo(i, xAxis + y);
            }

            this.ctx.stroke();
        } else {
            this.ctx.lineTo(this.theremin.w, xAxis);
            this.ctx.stroke();
        }
    };

    Visualizer.prototype.drawBackground = function drawBackground() {
        var _theremin = this.theremin;
        var x = _theremin.x;
        var y = _theremin.y;
        var w = _theremin.w;
        var h = _theremin.h;

        var w2 = w / 2;
        var h2 = h / 2;

        // this.ctx.fillStyle = '#FFFFFF';
        // this.ctx.fillRect(0, 0, w, h);

        var r1 = Math.floor(scaleBetween(y, 50, 155, h, 0));
        var g1 = Math.floor(scaleBetween(y, 200, 50, h, 0));
        var b1 = Math.floor(scaleBetween(x, 100, 255, 0, w));

        var r2 = Math.floor(scaleBetween(y, 95, 255, 0, h));
        var g2 = Math.floor(scaleBetween(y, 155, 95, 0, h));
        var b2 = Math.floor(scaleBetween(x, 95, 255, 0, w));

        var color1 = 'rgb(' + r1 + ', ' + g1 + ', ' + b1 + ')';
        var color2 = 'rgb(' + r2 + ', ' + g2 + ', ' + b2 + ')';

        var r = Math.max(w, h) * 2;

        var grad1 = this.ctx.createRadialGradient(w2, h2, r, x, y, 0);
        grad1.addColorStop(0, color1);
        grad1.addColorStop(1, color2);
        this.ctx.fillStyle = grad1;
        this.ctx.fillRect(0, 0, w, h);
    };

    Visualizer.prototype.drawPoint = function drawPoint() {
        var r1 = 16 * DPR;
        var r2 = 2 * DPR;
        this.ctx.lineWidth = 2 * DPR;
        this.ctx.strokeStyle = '#222';
        this.ctx.beginPath();
        this.ctx.arc(this.theremin.x, this.theremin.y, r1, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(this.theremin.x, this.theremin.y, r2, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
    };

    Visualizer.prototype.drawText = function drawText() {
        var ms = Math.min(this.theremin.w, this.theremin.h);
        var size = ms / 12;
        this.ctx.font = '900 ' + size + 'px futura-pt, Raleway, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'white';

        var copy = 'Oscillator wave';
        this.ctx.fillText(copy, this.theremin.w / 2, this.theremin.h / 2 + size / 3);
    };

    // Animation Loop

    return Visualizer;
}();

var root = document.getElementById('root');

var theremin = new Theremin(root);
