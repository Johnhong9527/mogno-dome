const http = require('../util/http');

// 获取加密章节内容
/**
 *
 * @param aid book id
 * @param cid chapter id
 * @return {Promise<加密章节数据>}
 */
function getChapter(aid, cid) {
  return http('post', 'https://storybl.com/api/chapter/', { aid, cid });
}

function getChapterList(aid) {
  return http('post', 'https://storybl.com/tool/getChapterList/', { verify: 'smfx', aid, sbt: '提交' });
}

module.exports = {
  getChapter,
  getChapterList,
};
