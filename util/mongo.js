// 多个数据库连接
//首先创建两个数据库连接
const mongoose = require('mongoose');
const config = require('../config/index.js');
// 连接数据库
const biquge = connect('biquge');
const xxxbz = connect('xxxbz');

function connect(title) {
  const mongo = mongoose.createConnection(config[title].url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongo.on('connected', function(err) {
    if (err) {
      console.log('连接 ' + title + ' 数据库失败：' + err);
    } else {
      console.log('连接 ' + title + ' 数据库成功！');
    }
  });
  mongo.on(
    'error',
    console.error.bind(console, 'MongoDB ' + title + ' connection error:'),
  );
  return mongo;
}

module.exports = {
  biquge,
  xxxbz,
};
