'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * [BooksSchema description]
 * 书名 --> title str
 * 作者 --> author str
 * 书籍ID --> aid num
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
  title: { type: String, default: '' },
  author: { type: String, default: '' },
  aid: { type: Number, default: '' },
  list: {
    type: Array,
    default: [],
    title: { type: String },
    path: { type: String },
    aid: { type: Number },
    cid: { type: Number },
    href: { type: String },
    chapters: { type: Object, default: {} },
  },

});
BooksSchema.add({
  index: { type: Number },
});
const Books = mongoose.model('Books', BooksSchema);
module.exports = Books;
