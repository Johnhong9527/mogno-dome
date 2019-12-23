'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const mongo = require('../util/mongo.js');
const Schema = mongoose.Schema;
const ChapterSchema = new Schema({
	title: { type: String }, // 章节名
	book_id: { type: String }, // 书籍ID
	cid: { type: Number }, // 章节ID
	href: { type: String }, // 章节原地址
	index: { type: Number }, // 章节索引
	content: { type: String }, // 章节内容
});
const Chapter = mongo.biquge.model('Chapter', ChapterSchema);
module.exports = Chapter;
