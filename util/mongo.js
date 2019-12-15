// 多个数据库连接
//首先创建两个数据库连接
const mongoose = require('mongoose');
const config = require('../config/index.js');
// 连接数据库
const storybl = mongoose.createConnection(config.storybl.url, { useNewUrlParser: true, useUnifiedTopology: true });
storybl.on('connected', function(err) {
  if (err) {
    console.log('连接' + config.storybl.title + '数据库失败：' + err);
  } else {
    console.log('连接' + config.storybl.title + '数据库成功！');
  }
});
const xxxbz = mongoose.createConnection(config.xxxbz.url, { useNewUrlParser: true, useUnifiedTopology: true });
xxxbz.on('connected', function(err) {
  if (err) {
    console.log('连接' + config.xxxbz.title + '数据库失败：' + err);
  } else {
    console.log('连接' + config.xxxbz.title + '数据库成功！');
  }
});
module.exports = {
  storybl,
  xxxbz
}