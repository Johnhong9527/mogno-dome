'use strict';
// 章节去重
const _Chapters = require('./model/chapters.js');
agg().then(r => console.log(r));

async function agg() {
  try {
    const aggregate = await _Chapters.aggregate([
      {
        $group: {
          _id: {title: '$title', href: '$href'},
          count: {$sum: 1},
          dup: {$addToSet: '$_id'}
        }
      },
      {
        $match: {count: {$gt: 1}}
      }]);
    if (aggregate.length > 0) {
      for (let i = 0; i < aggregate.length; i++) {
        let chapter = aggregate[i];
        let dup = chapter.dup;
        if (dup.length > 1) {
          await _Chapters.remove({_id: dup[0]});
        }
      }
    }
    return new Promise(resolve => resolve(aggregate));
  } catch (e) {
    console.log(e);
  }
}
