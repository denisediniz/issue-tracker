const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
let testId;

chai.use(chaiHttp);

suite('Functional Tests', function () {

	suite('POST /api/issues/{project} => object with issue data', function () {

		test('Every field filled in', function (done) {
			chai.request(server)
				.post('/api/issues/test')
				.send({
					issue_title: 'Title',
					issue_text: 'text',
					created_by: 'Functional Test - Every field filled in',
					assigned_to: 'Chai and Mocha',
					status_text: 'In QA'
				})
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.body.issue_title, 'Title');
					assert.equal(res.body.issue_text, 'text');
					assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
					assert.equal(res.body.assigned_to, 'Chai and Mocha');
					assert.equal(res.body.status_text, 'In QA');
					done();
				});
		});

		test('Required fields filled in', function (done) {
			chai.request(server)
				.post('/api/issues/test')
				.send({
					issue_title: 'Title',
					issue_text: 'text',
					created_by: 'Functional Test - Every field filled in'
				})
				.end(function(err, res) {
					assert.equal(res.status, 200);
					assert.isNotEmpty(res.body.issue_title);
					assert.isNotEmpty(res.body.issue_text);
					assert.isNotEmpty(res.body.created_by);
					testId = res.body._id; // test put and delete
					done();
				});
		});

		test('Missing required fields', function (done) {
			chai.request(server)
				.post('/api/issues/test')
				.send({
					issue_title: '',
					issue_text: '',
					created_by: ''
				})
				.end(function(err, res) {
					assert.equal(res.status, 400);
					assert.equal(res.body.error[0].msg, 'Missing required fields');
					done();
				});
		});

	});

	suite('PUT /api/issues/{project} => text', function () {

		test('No body', function (done) {
			chai.request(server)
				.put('/api/issues/test')
				.send({
					_id: testId
				})
				.end(function(err, res) {
					assert.equal(res.status, 400);
					assert.equal(res.text, 'no updated field sent');
					done();
				})
		});

		test('One field to update', function (done) {
			chai.request(server)
				.put('/api/issues/test')
				.send({
					_id: testId,
					issue_title: 'Updated title'
				})
				.end(function(err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.text, 'successfully updated');
					done();
				});
		});

		test('Multiple fields to update', function (done) {
			chai.request(server)
				.put('/api/issues/test')
				.send({
					_id: testId,
					issue_title: 'Updated title',
					issue_text: 'updated text'
				})
				.end(function(err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.text, 'successfully updated');
					done();
				});
		});

	});


	suite('GET /api/issues/{project} => Array of objects with issue data', function () {

		test('No filter', function (done) {
			chai.request(server)
				.get('/api/issues/test')
				.query({})
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.isArray(res.body);
					assert.property(res.body[0], 'issue_title');
					assert.property(res.body[0], 'issue_text');
					assert.property(res.body[0], 'created_on');
					assert.property(res.body[0], 'updated_on');
					assert.property(res.body[0], 'created_by');
					assert.property(res.body[0], 'assigned_to');
					assert.property(res.body[0], 'open');
					assert.property(res.body[0], 'status_text');
					assert.property(res.body[0], '_id');
					done();
				});
		});

		test('One filter', function (done) {
			chai.request(server)
				.get('/api/issues/test')
				.query({
					open: true
				})
				.end(function(err, res) {
					assert.equal(res.status, 200);
					assert.isArray(res.body);
					assert.property(res.body[0], 'issue_title');
					assert.property(res.body[0], 'issue_text');
					assert.property(res.body[0], 'created_on');
					assert.property(res.body[0], 'updated_on');
					assert.property(res.body[0], 'created_by');
					assert.property(res.body[0], 'assigned_to');
					assert.property(res.body[0], 'open');
					assert.property(res.body[0], 'status_text');
					assert.property(res.body[0], '_id');
					assert.equal(res.body[0].open, true);
					done();
				});
		});

		test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
			chai.request(server)
				.get('/api/issues/test')
				.query({
					open: true,
					created_by: 'Functional Test - Every field filled in'
				})
				.end(function(err, res) {
					assert.equal(res.status, 200);
					assert.isArray(res.body);
					assert.property(res.body[0], 'issue_title');
					assert.property(res.body[0], 'issue_text');
					assert.property(res.body[0], 'created_on');
					assert.property(res.body[0], 'updated_on');
					assert.property(res.body[0], 'created_by');
					assert.property(res.body[0], 'assigned_to');
					assert.property(res.body[0], 'open');
					assert.property(res.body[0], 'status_text');
					assert.property(res.body[0], '_id');
					assert.equal(res.body[0].open, true);
					assert.equal(res.body[0].created_by, 'Functional Test - Every field filled in');
					done();
				});
		});

	});

	suite('DELETE /api/issues/{project} => text', function () {

		test('No _id', function (done) {
			chai.request(server)
				.delete('/api/issues/test')
				.send()
				.end(function(err, res) {
					assert.equal(res.status, 400);
					assert.equal(res.text, '_id error');
					done();
				});
		});

		test('Valid _id', function (done) {
			chai.request(server)
				.delete('/api/issues/test')
				.send({
					_id: testId
				})
				.end(function(err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.text, 'Deleted ' + testId);
					done();
				});
		});

	});

});
