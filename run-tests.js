const EventEmitter = require('events').EventEmitter;

const Mocha = require('mocha'),
	fs = require('fs'),
	path = require('path');

// Instantiate a Mocha instance.
const mocha = new Mocha({
	ui: 'tdd'
});

const testDir = './test'

// Add each .js file to the mocha instance
fs.readdirSync(testDir).filter(function (file) {
	// Only keep the .js files
	return file.substr(-3) === '.js';

}).forEach(function (file) {
	mocha.addFile(
		path.join(testDir, file)
	);
});

const emitter = new EventEmitter();

emitter.run = function () {
	try {
		const runner = mocha.run();
	} catch (err) {
		throw (err);
	}
};

module.exports = emitter;