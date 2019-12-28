'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const mongo = require('../util/mongo.js');
const Schema = mongoose.Schema;

const ChapterSchema = new Schema({
	title: { type: String },
	path: { type: String },
	book_id: { type: String },
	cid: { type: Number },
	href: { type: String },
	content: { type: String },
});

const Chapter = mongo.xxxbz.model('Chapter', ChapterSchema);
module.exports = Chapter;
