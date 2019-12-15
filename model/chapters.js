'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChapterSchema = new Schema({
  title: { type: String },
  path: { type: String },
  aid: { type: Number },
  cid: { type: Number },
  href: { type: String },
  content: { type: String },
});
ChapterSchema.add({
  index: { type: Number },
});

const Chapter = mongoose.model('Chapter', ChapterSchema);
module.exports = Chapter;
