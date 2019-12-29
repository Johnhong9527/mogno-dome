"use strict";

/**
 * Module dependencies.
 */

const mongoose = require("mongoose");
const mongo = require("../util/mongo.js");
const Schema = mongoose.Schema;
/**
 * [BooksSchema description]
 * 书名 --> title str
 * 来源 --> source str (各大小说网站)
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
  title: { type: String }, // 书名（不同书籍不可重复）
  source: { type: String }, // 来源(各大小说网站)
  author: { type: String }, //作者
  avatar: { type: String }, // 封面
  tag: { type: String }, // 标签
  tag_url: { type: String }, // 标签链接
  aid: { type: Number }, // 书籍原bookID（不同书籍不可重复）
  lastUpdate: { type: Number }, // 书籍最后更新时间
  status: { type: Number }, // 书籍更新进度
  intro: { type: String }, // 书籍简介
  index: { type: Number }, // 书籍排序
  href: { type: String }, // 书籍原链接
  open_id: { type: String }, // 书籍唯一ID（不同书籍不可重复）
  chapters: {
    type: Array,
    title: { type: String }, // 章节名（不同书籍可重复）
    cid: { type: Number }, // 章节ID（不同书籍可重复）
    href: { type: String } // 章节原地址
  }
});
const Books = mongo.storybl.model("Books", BooksSchema);
module.exports = Books;
