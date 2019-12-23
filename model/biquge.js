'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const mongo = require('../util/mongo.js');
const Schema = mongoose.Schema;
/**
 * [BooksSchema description]
 * 书名 --> title str
 * 来源 --> source str (各大小说网站)
 * 作者 --> author str
 * 书籍ID --> aid num
 * 书籍唯一ID --> openID = _id
 * 最后更新时间 --> latest update str
 * 最新章节 --> latest chapter num
 * 状态 --> status 0:连载 1:完结
 * 介绍 --> intro str
 * 排序 --> index num
 * 章节列表 --> chapters Arr
 *   章节 -->
 *     章节id
 *     章节名title
 * @type {Schema}
 */
const BooksSchema = new Schema({
	title: { type: String },
	source: { type: String },
	author: { type: String },
	avatar: { type: String },
	tag: { type: String },
	tag_url: { type: String },
	aid: { type: Number },
	lastUpdate: { type: Number },
	status: { type: Number },
	intro: { type: String },
	index: { type: Number },
	href: { type: String },
	open_id: { type: String },
	chapters: {
		type: Array,
		title: { type: String },
		path: { type: String },
		aid: { type: Number },
		cid: { type: Number },
		href: { type: String },
	},
});
const Books = mongo.biquge.model('Books', BooksSchema);
module.exports = Books;
