const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const { body, validationResult } = require('express-validator/check');
const { sanitizeParam, sanitizeQuery } = require('express-validator/filter');

module.exports = (app) => {
	app.route('/api/issues/:project')
		/**
		 * @swagger
		 * /api/issues/{project}:
		 *  post:
		 *   summary: Create an issue
		 *   description: Add an issue in a project containing required issue_title, issue_text, created_by, and optional assigned_to and status_text.
		 *   parameters:
		 *    - in: path
		 *      name: project
		 *      required: true
		 *   requestBody:
		 *    content:
		 *     application/json:
		 *      schema:
		 *       type: object
		 *       properties:
		 *        issue_title:
		 *         type: string
		 *         example: Title
		 *        issue_text:
		 *         type: string
		 *         example: text
		 *        created_by:
		 *         type: string
		 *         example: User A
		 *        assigned_to:
		 *         type: string
		 *         example: User B
		 *        status_text:
		 *         type: string
		 *         example: In QA
		 *       required:
		 *        - issue_title
		 *        - issue_text
		 *        - created_by
		 *   responses:
		 *    200:
		 *     description: Returns  all of those fields (blank for optional no input) and also include created_on(date/time), updated_on(date/time), open(boolean, true for open, false for closed), and _id.
		 *     content:
		 *      application/json:
		 *       schema:
		 *        type: object
		 *        properties:
		 *         issue_title:
		 *          type: string
		 *          example: Title
		 *         issue_text:
		 *          type: string
		 *          example: text
		 *         created_by:
		 *          type: string
		 *          example: User A
		 *         assigned_to:
		 *          type: string
		 *          example: User B
		 *         status_text:
		 *          type: string
		 *          example: In QA
		 *         created_on:
		 *          type: string
		 *          format: date-time
		 *         updated_on:
		 *          type: string
		 *          format: date-time
		 *         open:
		 *          type: boolean
		 *         _id:
		 *          type: string
		 */
		.post([
			body('issue_title', 'Missing required fields').not().isEmpty().trim().escape(),
			body('issue_text', 'Missing required fields').not().isEmpty().trim().escape(),
			body('created_by', 'Missing required fields').not().isEmpty().trim().escape(),
			body('assigned_to').trim().escape(),
			body('status_text').trim().escape(),
			sanitizeParam('project').trim().escape()
		], (req, res) => {

			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				// there are errors
				res.status(400).json({ error: errors.array() });
			} else {
				// data from form is valid

				const issue = {
					issue_title: req.body.issue_title,
					issue_text: req.body.issue_text,
					created_by: req.body.created_by,
					assigned_to: req.body.assigned_to || '',
					status_text: req.body.status_text || '',
					created_on: new Date(),
					updated_on: new Date(),
					open: true
				};

				MongoClient.connect(process.env.DB_URL, function (err, client) {

					if (err) res.status(500).send(err);

					const db = client.db(process.env.DB_NAME);

					db.collection(req.params.project).insertOne(issue, function (err, newIssue) {
						if (err) res.status(500).send(err);
						res.status(200).json(issue);
					});

					client.close();

				});

			}

		})
		/**
		 * @swagger
		 * /api/issues/{project}:
		 *  get:
		 *   summary: Read an issue
		 *   description: Get for an array of all issues on that specific project with all the information for each issue as was returned when posted. You can filter by also passing along any field and value in the query.
		 *   parameters:
		 *    - in: path
		 *      name: project
		 *      required: true
		 *      schema:
		 *       type: string
		 *    - in: query
		 *      name: issue_title
		 *      schema:
		 *       type: string
		 *    - in: query
		 *      name: issue_text
		 *      schema:
		 *       type: string
		 *    - in: query
		 *      name: created_by
		 *      schema:
		 *       type: string
		 *    - in: query
		 *      name: assigned_to
		 *      schema:
		 *       type: string
		 *    - in: query
		 *      name: status_text
		 *      schema:
		 *       type: string
		 *    - in: query
		 *      name: created_on
		 *      schema:
		 *       type: string
		 *       format: date-time
		 *    - in: query
		 *      name: updated_on
		 *      schema:
		 *       type: string
		 *       format: date-time
		 *    - in: query
		 *      name: open
		 *      schema:
		 *       type: boolean
		 *    - in: query
		 *      name: _id
		 *      schema:
		 *       type: string
		 *   responses:
		 *    200:
		 *     description: List of issues
		 *     content:
		 *      application/json:
		 *       schema:
		 *        type: array
		 *        items:
		 *         type: object
		 *         properties:
		 *          issue_title:
		 *           type: string
		 *           example: Title
		 *          issue_text:
		 *           type: string
		 *           example: text
		 *          created_by:
		 *           type: string
		 *           example: User A
		 *          assigned_to:
		 *           type: string
		 *           example: User B
		 *          status_text:
		 *           type: string
		 *           example: In QA
		 *          created_on:
		 *           type: string
		 *           format: date-time
		 *          updated_on:
		 *           type: string
		 *           format: date-time
		 *          open:
		 *           type: boolean
		 *          _id:
		 *           type: string
		 */
		.get([
			sanitizeParam('project').trim().escape(),
			sanitizeQuery('issue_title').trim().escape(),
			sanitizeQuery('issue_text').trim().escape(),
			sanitizeQuery('created_on').toDate(),
			sanitizeQuery('updated_on').toDate(),
			sanitizeQuery('created_by').trim().escape(),
			sanitizeQuery('assigned_to').trim().escape(),
			sanitizeQuery('open').toBoolean(),
			sanitizeQuery('status_text').trim().escape(),
			sanitizeQuery('_id').customSanitizer(value => { return ObjectId(value); })
		], (req, res) => {

			MongoClient.connect(process.env.DB_URL, function (err, client) {

				if (err) res.status(500).send(err);

				const db = client.db(process.env.DB_NAME);

				db.collection(req.params.project).find({ ...req.query }).toArray(function (err, issues) {
					if (err) res.status(500).send(err);
					res.status(200).json(issues);
				});

				client.close();

			});

		})
		/**
		 * @swagger
		 * /api/issues/{project}:
		 *  put:
		 *   summary: Update an issue
		 *   description: Update any fields in the object with a _id. The field *updated_on* is always updated with the current date/time.
		 *   parameters:
		 *    - in: path
		 *      name: project
		 *      required: true
		 *      schema:
		 *       type: string
		 *   requestBody:
		 *    content:
		 *     application/json:
		 *      schema:
		 *       type: object
		 *       properties:
		 *        issue_title:
		 *         type: string
		 *         example: Title
		 *        issue_text:
		 *         type: string
		 *         example: text
		 *        created_by:
		 *         type: string
		 *         example: User A
		 *        assigned_to:
		 *         type: string
		 *         example: User B
		 *        status_text:
		 *         type: string
		 *         example: In QA
		 *        created_on:
		 *         type: string
		 *         format: date-time
		 *        open:
		 *         type: boolean
		 *        _id:
		 *         type: string
		 *       required:
		 *        - _id
		 *   responses:
		 *    200:
		 *     content:
		 *      text/html:
		 *       schema:
		 *        type: string
		 *       example: 'successfully updated'
		 */
		.put([
			body('_id').trim().escape(),
			body('issue_title').trim().escape(),
			body('issue_text').trim().escape(),
			body('created_by').trim().escape(),
			body('assigned_to').trim().escape(),
			body('open').toBoolean(),
			body('status_text').trim().escape(),
			sanitizeParam('project').trim().escape()
		], (req, res) => {

			// copy body params to items omitting _id
			const { _id, ...items } = req.body;

			if (Object.keys(items).length === 0) {
				res.status(400).send('no updated field sent');
			} else {

				MongoClient.connect(process.env.DB_URL, function (err, client) {

					if (err) res.status(500).send(err);

					const db = client.db(process.env.DB_NAME);

					db.collection(req.params.project).updateOne(
						{ _id: ObjectId(req.body._id) },
						{ $set: { ...items, updated_on: new Date() } },
						function (err, updateIssue) {
							if (err) res.status(400).send('could not update ' + req.body._id);
							res.status(200).send('successfully updated');
						});

					client.close();

				});
			}

		})
		/**
		 * @swagger
		 * /api/issues/{project}:
		 *  delete:
		 *   summary: Delete an issue
		 *   description: Delete an issue with a _id to completely delete an issue.
		 *   parameters:
		 *    - in: path
		 *      name: project
		 *      required: true
		 *      schema:
		 *       type: string
		 *   requestBody:
		 *    content:
		 *     application/json:
		 *      schema:
		 *       type: object
		 *       properties:
		 *        _id:
		 *         type: string
		 *   responses:
		 *    200:
		 *     content:
		 *      text/html:
		 *       schema:
		 *        type: string
		 *       example: 'Deleted xyz'
		 */
		.delete([
			body('_id', '_id error').not().isEmpty(),
			sanitizeParam('project').trim().escape()
		], (req, res, next) => {

			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				res.status(400).send(errors.array()[0].msg);
			} else {

				MongoClient.connect(process.env.DB_URL, function (err, client) {

					if (err) res.status(500).send(err);

					const db = client.db(process.env.DB_NAME);

					db.collection(req.params.project).deleteOne({ _id: ObjectId(req.body._id) }, function (err, newIssue) {
						if (err) res.status(400).send('Could not delete ' + req.body._id);
						res.status(200).send('Deleted ' + req.body._id);
					});

					client.close();

				});
			}
		});
};