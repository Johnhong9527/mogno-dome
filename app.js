const mongoose = require('mongoose');
// const config = require('./config');
// 连接mongodb数据库
// connect(config.storybl);
// const db = require('./util/mongo');
// const puppeteer = require('puppeteer');
const log = require('./util/log');
const _chapter = require('./controllers/chapter');

const _Books = require('./model/books');
test();
async function test() {
  try {
    const books = await _Books.find({}, { list: 0 });
    console.log(books)
  } catch (e) {
    console.log('e', e)
  }
}
// 所有已经下载小说合集
// 创建书籍信息
/**
aid: 书籍ID
title：书籍名
*/
async function createBook() {
  try {
    await _book.create(config.book_info);
  } catch (e) {
    log.writeFile(e);
  }
}

// 获取书籍章节列表信息 访问网页获取dom元素
// getChapters(config);

async function getChapters(data) {
  try {
    // 打开网页
    const browser = await puppeteer.launch({
      headless: false,
      timeout: 300000,
    });
    const page = await browser.newPage();
    await page.goto(data.book_info.url);
    // 等待元素出现
    console.log('等待页面准备好');
    await page.waitForSelector('.ml_list');
    /*
     * 待测试
     * 获取ul>li>a目录列表
     * 编辑下标为1的href数据
     * 讲数据全部存入mongodb中
     * */

    // 保持数据到本地
    const list = await page.$$eval('.ml_list ul li a', els => Array.from(els).map(el => {
      return {
        href: el.href,
        aid: Number.parseInt(el.href.split('/')[4]),
        cid: el.href.split('/')[5].split('.')[0],
        title: el.innerText,
      };
    }));
    await _book.updateBookList(list);
    // fs.writeFileSync('./api/chapter.js', JSON.stringify(list));
    // 关闭浏览器
    await browser.close();
  } catch (e) {
    log.writeFile(e);
  }
}

// getChapters(config);

async function getChapterPage(data) {
  try {
    const browser = await puppeteer.launch({
      // headless: false,
      timeout: 300000, // 300秒超时
    });
    const page = await browser.newPage();
    await page.goto(`http://www.xinyushuwu.com/0/${data.aid}/${data.cid}.html`);
    // await page.goto(data.href);
    // 等待指定元素出现
    console.log('等待页面准备好');
    await page.waitForSelector('#articlecontent');
    // const title = await page.$eval('.nr_title h3', el => el.innerText);
    const chapter = await page.$eval('#articlecontent', el => el.innerText);
    await browser.close();
    console.log('正在下载...');
    return new Promise(resolve => resolve(chapter));

  } catch (e) {
    log.writeFile(e);
  }
}

// 下载每章节内容
// getChapter(config.book_info.aid);

async function getChapter(aid) {
  const book = await _book.find({ aid });
  const _id = book._id;
  const chapters = book.list;
  const len = chapters.length;
  let index = 112;
  const bookIndex = book.index;
  get();

  async function get() {
    try {
      const chapter = await getChapterPage(chapters[index]);
      if (chapter && chapter !== '') {
        chapters[index].content = chapter;
        chapters[index].index = bookIndex;
        await _chapter.create(chapters[index]);
        if (index !== len - 1) {
          index++;
          console.log('index:', index, '  len:', len, '   cid:', chapters[index].cid);
          get();
        } else {
          console.log('下载完成');
        }
      } else {
        get();
      }
    } catch (e) {
      console.log(e);
    }
  }
}

// 连接数据库
function connect(mongo) {
  /* mongoose.connection
      .on('error', console.log)
      .on('disconnected', connect)
      .once('open', listen);*/
  // return mongoose.connect(config.db, {keepAlive: 1, useNewUrlParser: true, useUnifiedTopology: true});
  console.log(mongo)
  mongoose.connect(mongo.url, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    // we're connected!
    console.log('连接' + mongo.title + '成功');
  });
}

// 关闭数据库
function mongodbClose() {
  mongoose.connection.close();
}