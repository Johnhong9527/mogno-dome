'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const mongo = require('../util/mongo.js')
const Schema = mongoose.Schema;

const ChapterSchema = new Schema({
  title: { type: String },
  path: { type: String },
  aid: { type: Number },
  cid: { type: Number },
  href: { type: String },
  index: { type: Number },
  content: { type: String },
});

/*ChapterSchema.add({
  index: { type: Number },
});*/

const Chapter = mongo.xxxbz.model('Chapter', ChapterSchema);
module.exports = Chapter;