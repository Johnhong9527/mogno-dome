'use strict';
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-core');
const fs = require('fs');
const progress = require('progress');
const _Books = require('./model/books.js');
const _Chapters = require('./model/chapters.js');
const URL = 'https://www.biquge.com.cn/quanben/4.html';

// 获取小说总页数
function pages(data) {
  const pages = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].title.search(/(第\d页)/) > -1) {
      pages.push(data[i]);
    }
  }
  return pages;
}

// 获取小说列表
async function getBookList(dom) {
  try {
    return await dom.$$eval('.novelslist2 li', els =>
      Array.from(els).map(el => {
        if (el.querySelectorAll('.s1')[0].innerText !== '作品分类') {
          return {
            tag: el
              .querySelectorAll('.s1')[0]
              .innerText.replace(/(\[)|(\])/g, ''),
            tag_url: el.querySelectorAll('.s1 a')[0].href,
            source: '笔趣阁',
            aid: Number.parseInt(
              el.querySelectorAll('.s2 a')[0].href.replace(/.*book\//, ''),
            ),
            title: el.querySelectorAll('.s2')[0].innerText,
            href: el.querySelectorAll('.s2 a')[0].href,
            author: el.querySelectorAll('.s4')[0].innerText,
            lastUpdate:
              Date.parse(el.querySelectorAll('.s5')[0].innerText) / 1000,
            status: el.querySelectorAll('.s6')[0].innerText === '完结' ? 1 : 0,
          };
        }
      }),
    );
  } catch (e) {
    console.log(e);
  }
}

// 存入数据库中
async function saveBook(data) {
  try {
    for (let i = 0; i < data.length; i++) {
      // 去重
      const { aid, title } = data[i];
      const isBook = await _Books.find({
        aid,
        title,
      });
      console.clear();
      console.log(i);
      if (isBook.length !== 0) {
        continue;
      }
      const booksCount = await _Books.countDocuments();
      // await new
      const newBook = await new _Books({
        index: booksCount,
        ...data[i],
      });
      await newBook.save();
    }
  } catch (e) {
    console.log(e);
  }
}

async function getBook() {
  try {
    // 下一页点击次数
    const taps = 0;
    // 打开网页
    const browser = await puppeteer.launch({
      headless: false,
      timeout: 300000,
    });
    const page = await browser.newPage();
    await page.goto(URL);
    await page.setViewport({ width: 1280, height: 800 });
    // 得到当前页的所有书籍信息元素
    let book_list = await getBookList(page);
    // book_list = book_list.splice(1, book_list.length)
    book_list.shift();
    await saveBook(book_list);
    // 等待元素出现
    // console.log('等待页面准备好');
    // await page.waitForSelector('#fanye');
    /*const list = await page.$$eval('#fanye a', els => Array.from(els).map(el => {
      return {
        href: el.href,
        title: el.title,
      };
    }));*/
    /*for (let i = 0; i < pageList.length; i++) {
      if (pageList[i].href !== URL) {
        const pageList = await pages(list);
        await page.goto(pageList[i].href);
        await page.setViewport({ width: 800, height: 800 });
      }
    }*/
    // 关闭浏览器
    await browser.close();
  } catch (e) {
    console.log(e);
  }
}

// 获取每一本书的章节简介
// getChapters();
async function getChapters() {
  try {
    let index = 0;
    // get book list
    const books = await _Books.find({ source: '笔趣阁' });
    const len = books.length;
    // const len = 1
    // 打开网页
    const browser = await puppeteer.launch({
      headless: false,
      timeout: 300000,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await goto();

    // 处理获取到的a标签
    async function goto() {
      try {
        if (index < len) {
          await page.goto(books[index].href);
          // avatar
          const avatar = await page.$eval('#fmimg > img', el => el.src);
          // intro
          const intro = await page.$eval('#intro', el => el.innerHTML);
          // chapters
          /*const chapters = await page.$$eval('#list dd a', els => Array.from(els).map(el => {
            return {
              href: el.href,
              title: el.innerText
            }
          }))
          chapters.map(el => {
            el.cid = Number.parseInt(el.href.replace(/(.*\/)|(\.html)/g, ''));
            el.aid = books[index].aid;
          })*/
          // 存储结果
          const update = await _Books.updateOne(
            { aid: books[index].aid, index: books[index].index },
            {
              $set: {
                // chapters: chapters,
                avatar: avatar,
                intro: intro,
              },
            },
          );
          setTimeout(async () => {
            console.log(index);
            // console.log(intro)
            index++;
            await goto();
          }, 10);
        } else {
          // 关闭浏览器
          await browser.close();
        }
      } catch (e) {
        console.log(e);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

// 根据传入的aid创建书籍
// getAidCreateBook(28454)
async function getAidCreateBook(aid) {
  try {
    const book_url = `https://www.biquge.com.cn/book/${aid}`;
    // 打开网页
    const browser = await puppeteer.launch({
      // headless: false,
      timeout: 300000,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(book_url);
    const title = await page.$eval('#info h1', el => el.innerText);

    // return
    const isCreateBook = true;
    const isSetChapters = true;
    const books = await _Books.find({ aid, title });
    if (books.length !== 0) {
      console.log('判断是否需要更新书籍信息');
      /*for (let i = 0; i < books.length; i++) {
        if (books[i].chapters.length < chapters.length) {
          await _Books.updateOne({
            index: books[i].index,
            aid: books[i].aid,
          }, {
            '$set': {
              chapters
            }
          })
        }
      }*/
    } else {
      // 作者
      const author = await page.$eval('#info p', el =>
        el.innerText.replace(/作.*者：/, ''),
      );
      // avatar
      const avatar = await page.$eval('#fmimg > img', el => el.src);
      // intro
      const intro = await page.$eval('#intro', el => el.innerHTML);
      // status
      const status = await page.$eval('#info > p:nth-child(3)', el =>
        el.innerText.replace(/(状.*态：)|(,.*)/g, '') === '完结' ? 1 : 0,
      );
      // lastUpdate
      const lastUpdate = await page.$eval(
        '#info > p:nth-child(4)',
        el => Date.parse(el.innerText.replace('最后更新：', '')) / 1000,
      );
      // tag
      const tag = await page.$eval(
        '#wrapper > div:nth-child(5) > div.con_top > a:nth-child(2)',
        el => el.innerText,
      );
      // tag_url
      const tag_url = await page.$eval(
        '#wrapper > div:nth-child(5) > div.con_top > a:nth-child(2)',
        el => el.href,
      );
      // source
      const source = '笔趣阁';
      // chapters
      const chapters = await page.$$eval('#list dd a', els =>
        Array.from(els).map(el => {
          return {
            href: el.href,
            title: el.innerText,
          };
        }),
      );

      chapters.map(el => {
        el.cid = Number.parseInt(el.href.replace(/(.*\/)|(\.html)/g, ''));
        el.aid = aid;
      });

      await saveBook([
        {
          chapters,
          author,
          avatar,
          intro,
          tag,
          aid,
          title,
          href: book_url,
          tag_url,
          source,
          status: status,
          lastUpdate,
        },
      ]);
    }
    // 关闭浏览器
    await browser.close();
    process.exit();
  } catch (e) {
    console.log(e);
  }
}

// getChapter();

async function getPage() {
  try {
  } catch (e) {
    console.log(e);
  }
}

// saveChapter();
const arr = [
  'https://www.biquge.com.cn/book/20685/5971308.html',
  'https://www.biquge.com.cn/book/20685/5971309.html',
  'https://www.biquge.com.cn/book/20685/5971310.html',
  'https://www.biquge.com.cn/book/20685/5971311.html',
  'https://www.biquge.com.cn/book/20685/5971312.html',
  'https://www.biquge.com.cn/book/20685/5971313.html',
  'https://www.biquge.com.cn/book/20685/5971314.html',
  'https://www.biquge.com.cn/book/20685/5971315.html',
  'https://www.biquge.com.cn/book/20685/5971316.html',
  'https://www.biquge.com.cn/book/20685/5971317.html',
  'https://www.biquge.com.cn/book/20685/5971318.html',
];

async function saveChapter() {
  try {
    // 打开网页
    const browser = await puppeteer.launch({
      headless: false,
      timeout: 300000,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    for (let i = 0; i < arr.length; ) {
      await page.goto(arr[i]);
      await page.waitForSelector(
        '#wrapper > div.content_read > div > div.bookname > h1',
      );
      const title = await page.$eval(
        '#wrapper > div.content_read > div > div.bookname > h1',
        el => el.innerText,
      );
      const content = await page.$eval('#content', el => el.innerText);
      console.log(i);
    }
  } catch (e) {
    console.log(e);
  }
}

getChapter();

async function getChapter() {
  try {
    /*const book = await _Books.findOne({aid: 26583});
    const bookChapters = book.chapters;
    const dow = [];
    const bar = new progress('progress: [:bar] :current', {total: bookChapters.length, width: 70, complete: '*'});
    for (let i = 0; i < bookChapters.length; i++) {
      const chapter = await _Chapters.find({aid: 26583, href: bookChapters[i].href});
      if (chapter.length === 0) {
        dow.push(bookChapters[i]);
      } else {
        // add cid
        if (!chapter[0].cid) {
          if (chapter[0].title === bookChapters[i].title) {
            await _Chapters.updateOne(chapter[0], {
              '$set': {
                cid: bookChapters[i].cid
              }
            });
          }
        }
      }
      bar.tick();
    }
    fs.writeFileSync('dow.js', `module.exports = ${JSON.stringify(dow)}`);
    process.exit();
    return;*/

    const books = await _Books.find({ source: '笔趣阁' });
    const len = books.length;
    let index = fs.readFileSync('./index', 'utf8');
    index = Number.parseInt(index);

    goto(books[index].chapters);
    // 打开网页
    const browser = await puppeteer.launch({
      // executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
      // headless: false,
      timeout: 0,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    // goto(require('./dow'));
    goto(books[index].chapters);

    async function goto(data) {
      try {
        const bar = new progress(index + ': [:bar] :current/:total', {
          total: data.length,
          width: 50,
        });
        for (let c = 0; c < data.length; c++) {
          const { aid, index, cid } = data[c];
          const oldChapters = await _Chapters.find({ aid, cid });
          await bar.tick();
          if (oldChapters.length > 0) continue;
          const href = data[c].href;
          await page.goto(href);
          await page.waitForSelector(
            '#wrapper > div.content_read > div > div.bookname > h1',
          );
          const title = await page.$eval(
            '#wrapper > div.content_read > div > div.bookname > h1',
            el => el.innerText,
          );
          const content = await page.$eval('#content', el => el.innerHTML);
          const newBook = await new _Chapters({
            index,
            aid,
            cid,
            title,
            href,
            content,
          });
          await newBook.save();
        }
        if (bar.complete) {
          fs.writeFileSync('index', index);
          index++;
          goto(books[index].chapters);
        }
      } catch (e) {
        console.log('test', e.message);
        if (e.message === 'Navigation timeout of 30000 ms exceeded') {
          goto(books[index].chapters);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}

/*
 * 获取到所有书籍信息
 * 循环提取chapters信息
 * 提取同时去判断章节数据有无下载
 * 没有下载的话，记录该条信息，存到本地中
 *
 * */
