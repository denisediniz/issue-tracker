const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJSDoc = require('swagger-jsdoc');

const apiRoutes = require('./routes/api');
const runner = require('./run-tests');

const app = express();

app.use(cors({ origin: '*' }));

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// index page
app.route('/')
	.get((req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));

// documentation settings and route
const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Issue Tracker',
			version: '1.0.0',
			description: 'RESTful API to manage and maintain lists of bugs and feature requests.'
		}
	},
	apis: [path.join(__dirname, 'routes', 'api.js')]
};

const swaggerSpec = swaggerJSDoc(options);

app.route('/docs')
	.get((req, res) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(swaggerSpec);
	});

// routing for API
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
	res.status(404)
		.type('text')
		.send('Not Found');
});

// start server (and tests)
app.listen(process.env.PORT, function () {
	console.log('Listening on ' + process.env.PORT);
	if (process.env.NODE_ENV === 'test') {
		console.log('Running Tests...');
		setTimeout(function () {
			try {
				runner.run();
			} catch (err) {
				console.log('Tests are not valid:');
				console.log(error);
			}
		}, 4000);
	}
});

module.exports = app;