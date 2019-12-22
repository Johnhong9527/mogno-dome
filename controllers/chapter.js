'use strict';
// const mongoose = require('mongoose');
// const _Bookss = mongoose.model('Books');

const _Chapter = require('../model/chapters');
const _Books = require('../model/books');
const _log = require('../util/log');

/**
 * find chapter info
 */
exports.find = async function(data) {
  return await _Chapter.findOne({ cid: data.cid, aid: data.aid });
};
/**
 * create chapter
 */
exports.create = async function(data) {
  const find = await this.find(data);
  let newChapter = '';
  try {
    if (!find) {
      newChapter = await new _Chapter(data);
      newChapter.save();
    }
  } catch (e) {
    _log.writeFile(e);
  }
};

/**
 * update chapter info
 */
exports.update = async function(data) {
  const find = await this.find({ aid: data.aid, cid: data.cid });
  try {
    if (!find) {
      this.create(data);
    } else {
      Object.keys(data).map((index, value) => {
        if (index !== 'title') {
          find[index] = data[index];
        }
      });
      find.save();
    }
  } catch (e) {
    _log.writeFile(e);
  }
};

exports.delete = async function(data) {
  try {
    await _Chapter.deleteOne({ aid: data.aid, cid: data.cid });
  } catch (e) {
    _log.writeFile(e);
  }
};

exports.setIndex = async function(aid) {
  try {
    const bookInfo = await _Books.findOne({ aid });
    const index = bookInfo.index;
    const chapters = await _Chapter.find({ aid });
    for (let i = 0; i < chapters.length; i++) {
      console.log(i);
      const info = await _Chapter.updateMany({ aid, cid: chapters[i].cid }, {
        $set: {
          index,
        },
      });
      console.log(info);
    }
  } catch (e) {
    _log.writeFile(e);
  }
};

