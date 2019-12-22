'use strict';
const puppeteer = require('puppeteer');
const _Books = require('./model/books.js');
let book_url = 'https://m.boquge.com/wapbook/3339.html';


let index = 0;
getChapters();

async function getChapters() {
  try {
    // 创建浏览器
    const browser = await puppeteer.launch({
      headless: false,
      // timeout: 0,
      args: [
        // export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:1080
        // '--disable-web-security', // 允许跨域
        // '--proxy-server=socks5://127.0.0.1:1080', // 代理
      ]
    });
    // 启动无痕模式
    // const context = await browser.createIncognitoBrowserContext();
// 新建标签页
//     const page = await context.newPage();
    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 800});
    // 打开网页
    /*
      获取书籍基本信息;
      判断书籍数据是否存在数据库中;
      如果没有重新创建;
      开始收集章节数据数据;
    */
    await page.goto(book_url);
    // 获取书籍基本信息;
    const bookInfo = await getBookInfo(page);
    // 判断书籍数据是否存在数据库中
    let book = await _Books.find({aid: bookInfo.aid, title: bookInfo.title});
    if (book.length === 0) {
      const booksCount = await _Books.countDocuments();
      const new_book = await _Books({
        index: booksCount,
        ...bookInfo
      });
      book = await new_book.save();
      console.log('created new Book');
    } else {
      // console.log(book);
    }
    book = await _Books.findOne({aid: bookInfo.aid, title: bookInfo.title});
    // 开始收集章节数据数据;
    await getNextPage(book_url.replace(/\.html/, '-1.html'));

    async function getNextPage(url) {
      try {
        // 打开网页
        await page.goto(url);
        /*// 开启请求拦截
        await page.setRequestInterception(true);
        // 设置request事件及回调函数
        page.on('request', async (request) => {
          // 除了 https://www.baidu.com/ 之外, 不加载别的url
          if (request.url() === url) {
            request.continue();
            return;
          }
          request.abort();
        });*/
        await page.waitForSelector('#pager > a');
        const nextPage = await page.$$eval('#pager > a', els => Array.from(els).map(el => {
          return {
            title: el.innerText,
            href: el.href
          };
        }));
        // 获取当前页的列表数据
        const chapterList = await getChapterList(page);
        // 存入数据库中
        if (book.chapters.length === 0) {
          // 当章节数为0时
          book.chapters = chapterList;
          await _Books.updateOne({aid: book.aid, index: book.index}, {'$set': book});
        } else {
          // 当书籍中的章节数超过0时，去重，添加数据
          const chaptersStr = JSON.stringify(book.chapters);
          for (let i = 0; i < chapterList.length; i++) {
            if (chaptersStr.indexOf(chapterList[i].title) < 0) {
              book.chapters.push(chapterList[i]);
            }
          }
          await _Books.updateOne({aid: book.aid, index: book.index}, {'$set': book});
        }
        // 下一页
        const isNext = isNextPage(nextPage);
        if (isNext) {
          index++;
          getNextPage(isNext.href);
        } else {
          console.log('下载完毕');
          process.exit();
        }
      } catch (e) {
        console.log(e.message);
      }
    }
  } catch (e) {
    console.log(e.message);
    if (e.message === 'Navigation timeout of 30000 ms exceeded') {
      getNextPage(book_url.replace(/\.html/, '-1.html'));
    }
  }
}

// 是否需要进入下一页
function isNextPage(data) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].title === '下一页') {
      return data[i];
    }
  }
  return false;
}

// 提取书籍信息
async function getBookInfo(page) {
  try {
    const tag = await page.$eval('div.novel-cover > dl > dd > p:nth-child(2) > a', el => el.innerText);
    const tag_url = await page.$eval('div.novel-cover > dl > dd > p:nth-child(2) > a', el => el.href);
    let aid_href = await page.$eval('div.novel-cover > dl > dd > p:nth-child(4) > a', el => el.href);
    const aid = Number.parseInt(aid_href.replace(/(http.*wapbook\/)|(_.*\.html)/g, ''));
    const title = await page.$eval('div.novel-cover > dl > dt > span', el => el.innerText);
    const href = `https://m.boquge.com/wapbook/${aid}.html`;
    const author = await page.$eval('div.novel-cover > dl > dd > p:nth-child(1)', el => el.innerText.replace('作者：', ''));
    const lastUpdate = Date.parse(new Date()) / 1000;
    const status = await page.$eval('div.novel-cover > dl > dd > p:nth-child(3)', el => el.innerText.indexOf('完本') > -1 ? 1 : 0);
    const avatar = await page.$eval('div.novel-cover > div > img', el => el.src);
    return {
      aid, tag, tag_url, title, href, author, lastUpdate, status, avatar,
      source: 'boquge'
    };
  } catch (e) {
    console.log(e);
  }
}

// 提取章节列表数据
async function getChapterList(page) {
  try {
    const aid = await page.$eval('#pager > a:nth-child(1)', el => el.href.replace(/(https.*wapbook\/)|(-.*\.html)/g, ''));
    return await page.$$eval('#chapterlist li a', els => Array.from(els).map(el => {

      return {
        aid,
        href: el.href,
        title: el.innerText,
        cid: Number.parseInt(el.href.replace(/(http.*_)|(\.html)/g, '')),
      };
    }));
  } catch (e) {
    console.log(e);
  }
}


///////////////////////////////////////   下载书籍章节内容    ////////////////////////////////////////////////
