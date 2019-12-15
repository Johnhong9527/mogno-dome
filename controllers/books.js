'use strict';
// const mongoose = require('mongoose');
// const _Books = mongoose.model('Books');

const _Books = require('../model/books');
const fs = require('fs');

const _log = require('../util/log');

exports.test = function(data) {
  console.log(data);
};
/**
 * find book info
 */
exports.find = async function(data) {
  return await _Books.findOne({ aid: data.aid });
};
/**
 * get all books info
 * @param data
 * @return {Promise<Array>}
 */
exports.findList = async function() {
  return await _Books.find({}, { aid: 1, title: 1, auther: 1 });
};

/**
 * create book
 */
exports.create = async function(data) {
  const allBook = await _Books.find({});
  const find = await this.find(data);
  let newBook = '';
  try {
    if (!find) {
      data.index = allBook.length;
      newBook = await new _Books(data);
      console.log(newBook);
      newBook.save();
    }
  } catch (e) {
    _log.writeFile(e);
  }
};

/**
 * update book info
 */
exports.update = async function(data) {
  const find = await this.find({ aid: data.aid });
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

/**
 * update book list
 * @param data
 * @return {Promise<void>}
 */
exports.updateBookList = async function(data) {
  const find = await this.find({ aid: data[0].aid });
  try {
    if (!find) {
      this.create({ aid: data[0].aid });
      this.updateBookList(data);
    } else {
      find.list = data;
      find.save();
    }
  } catch (e) {
    _log.writeFile(e);
  }
};

exports.setBookChapter = async function(_id, cid, data) {
  // console.log(data.page)
  const find = await _Books.updateOne({
    _id,
    'list.cid': cid,
  }, {
    $set: {
      'list.$.chapter': data,
    },
  });
  // console.log(find)
};

/**
 * 获取该书所有章节数据
 * @param aid
 * @return {Promise<Array>}
 */
exports.getBookChapters = async function(aid) {
  try {
    return await _Books.findOne({ aid }, { list: 1 });
  } catch (e) {
    _log.writeFile(e);
  }
};

/**
 * 清除多余章节
 * @param aid
 * @return {Promise<void>}
 */
exports.clearChapter = async function(aid) {
  try {
    const book = await _Books.findOne({ aid });
    const len = book.list.length;
    for (let i = 0; i < len; i++) {
      await _Books.updateMany({ aid }, {
        $set: {
          [`list.${i}.chapter`]: {},
        },
      });
    }
  } catch (e) {
    _log.writeFile(e);
  }
};

exports.setBookIndex = async function(aid, index) {
  try {
    await _Books.updateOne({ aid }, {
      $set: {
        index,
      },
    });
  } catch (e) {
    _log.writeFile(e);
  }

};

exports.getBookIndex = async function(aid) {
  try {
    return await _Books.findOne({ aid }, { index: 1 });
  } catch (e) {
    _log.writeFile(e);
  }
};
