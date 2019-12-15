const mongoose = require('mongoose');
const config = require('./config');
// 连接mongodb数据库
connect();
const superagent = require('superagent');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const list = require('./util/list');
const _data = require('./util/data');
const secret = require('./util/secret');
const log = require('./util/log');
const API = require('./api');
const _book = require('./controllers/books');
const CryptoJS = require('crypto-js');
const aid = config.book_info.aid;


// 执行顺序
// createBook();
// getPage(config);
setChapter(aid);

// 创建book基本信息

async function createBook() {
  try {
    await _book.create(config.book_info);
  } catch (e) {
    log.writeFile(e);
  }
}


// 访问网页获取dom元素
async function getPage(data) {
  try {
    // 打开网页
    const browser = await puppeteer.launch({
      // headless: false,
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
        title: el.innerText
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

// 从本地html文件中提取章节数据，存入mongodb
// getList('http://127.0.0.1:8080/');
async function getList(url) {
  let hotNews = [];
  superagent.get(url).end((err, res) => {
    if (err) {
      // 如果访问失败或者出错，会这行这里
      console.log(`热点新闻抓取失败 - ${err}`);
    } else {
      let $ = cheerio.load(res.text);
      $(' ul li a').each((inx, ele) => {
        const href = $(ele).attr('href');
        let news = {
          title: $(ele).text(), // 获取新闻标题
          path: href,
          aid,
          cid: href.split('.')[0],
          href: config.book_info.url + href, // 获取新闻网页链接
        };
        hotNews.push(news);
      });
      _book.updateBookList(hotNews);
      console.log('ok');
    }
  });
}

async function getChapter(data) {
  try {
    const browser = await puppeteer.launch({
      // 关闭无头模式，方便我们看到这个无头浏览器执行的过程
      // headless: false,
      timeout: 300000, // 300秒超时
    });
    const page = await browser.newPage();
    await page.goto(`http://www.xinyushuwu.com/0/${data.aid}/${data.cid}.html`);
    // await page.goto(data.href);
    // 等待指定元素出现
    // await page.waitForSelector('ul');
    // await page.screenshot({path: 'example.png'}); // 网页截图
    // await page.pdf({path: '9675530.pdf', format: 'A4'}); // 保持网页为pdf，尺寸为A4
    console.log('等待页面准备好');
    await page.waitForSelector('#articlecontent');
    const title = await page.$eval('.nr_title h3', el => el.innerText);
    const chapter = await page.$eval('#articlecontent', el => el.innerText);
    await browser.close();
    console.log('正在下载...');
    return new Promise(resolve => resolve({
      title,
      chapter
    }));

  } catch (e) {
    log.writeFile(e);
  }
}

// 下载每章节内容
async function setChapter(aid) {
  const find = await _book.find({aid});
  const _id = find._id;
  const chapters = find.list;
  let len = chapters.length;
  let index = 36;
  get();

  async function get() {
    try {
      const body = await getChapter(chapters[index]);
      if (body.chapter && body.chapter !== '') {
        await _book.setBookChapter(_id, chapters[index].cid, body);
        if (index !== len - 1) {
          index++;
          console.log('index:', index, '  len:', len, '   cid:', chapters[index].cid);

          get();

          /*setTimeout(() => {
            get();
          }, 1000);*/
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

// 下载到本地
// down(aid);

async function down(aid) {
  /*superagent.get(list[0].href).end((err, res) => {
      if (err) {
          // 如果访问失败或者出错，会这行这里
          console.log(`热点新闻抓取失败 - ${err}`);
      } else {
          let $ = cheerio.load(res.text);
          fs.writeFileSync(list[0].title, $("#nr1").text());
      }
    });*/

  const find = await _book.find({'aid': aid});
  const chapters = find.list;
  let index = 0;
  const len = chapters.length;
  // const len = 40;

  // console.log(_chapter)
  const cler = setInterval(function () {
    if (index === len) {
      clearInterval(cler);
      console.log('下载结束');
      return;
    } else {
      const chapter = chapters[index].chapter;
      const txt = '###' + chapter.title + '\n\n' + chapter.chapter + '\n\n';
      // const _chapter = secret(chapter.data, chapter.key, true);
      fs.appendFileSync('./test.txt', txt);
      index++;
      console.log('index', index, '  len', len);
    }
  }, 10);

  // console.log(find)

}

// 自检
const _list = require('./dow');
// selfCheck(aid);
// selfCheckAndGetChapter(aid);

async function selfCheck(aid) {
  console.log('开始');
  try {
    // 删除之前的 dow 文件
    // fs.unlinkSync('./dow');
    // 开始
    const find = await _book.find({aid});
    const chapters = find.list;
    let dow = [];
    // console.log('转化');
    Object.keys(chapters).map(index => {
      if (!chapters[index].chapter) {
        dow.push({
          index: index,
          title: chapters[index]['title']
        });
      }
    });
    // console.log('写入', dow);
    fs.writeFileSync('./dow.js', 'module.exports = ' + JSON.stringify(dow));
  } catch (e) {
    log.writeFile(e);
  }
}

async function selfCheckAndGetChapter(aid) {
  const find = await _book.find({aid});
  const _id = find._id;
  const chapters = find.list;
  let len = _list.length;
  let _i = 0;

  get();


  async function get() {
    try {
      console.log('开始下载', _i);
      let index = _list[_i].index;
      const body = await getChapter(chapters[index]);
      if (body.chapter !== '') {
        await _book.setBookChapter(_id, chapters[index].cid, body);
        if (_i !== len - 1) {
          _i++;
          console.log('index:', _i, '  len:', len, '   cid:', chapters[index].cid);
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

function connect() {
  /*mongoose.connection
      .on('error', console.log)
      .on('disconnected', connect)
      .once('open', listen);*/
  // return mongoose.connect(config.db, {keepAlive: 1, useNewUrlParser: true, useUnifiedTopology: true});
  mongoose.connect(config.db, {useNewUrlParser: true, useUnifiedTopology: true});
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    // we're connected!
    console.log('连接mongodb成功');
  });
}

function mongoseClose() {
  mongoose.connection.close();
}
