const puppeteer = require('puppeteer');
const fs = require('fs');
const _Books = require('./model/books.js');
const URL = 'https://www.biquge.com.cn/quanben/4.html';
const bookJson = require('./book.js')

// 获取小说总页数
function pages(data) {
  const pages = []
  for (let i = 0; i < data.length; i++) {
    if (data[i].title.search(/(第\d页)/) > -1) {
      pages.push(data[i])
    }
  }
  return pages
};

// 获取小说列表
async function getBookList(dom) {
  try {
    return await dom.$$eval('.novelslist2 li', els => Array.from(els).map(el => {
      if (el.querySelectorAll('.s1')[0].innerText !== '作品分类') {
        return {
          tag: el.querySelectorAll('.s1')[0].innerText.replace(/(\[)|(\])/g, ''),
          tag_url: el.querySelectorAll('.s1 a')[0].href,
          source: '笔趣阁',
          aid: Number.parseInt(el.querySelectorAll('.s2 a')[0].href.replace(/.*book\//, '')),
          title: el.querySelectorAll('.s2')[0].innerText,
          href: el.querySelectorAll('.s2 a')[0].href,
          author: el.querySelectorAll('.s4')[0].innerText,
          lastUpdate: Date.parse(el.querySelectorAll('.s5')[0].innerText) / 1000,
          status: el.querySelectorAll('.s6')[0].innerText === '完结' ? 1 : 0,
        }
      }
    }))
  } catch (e) {
    console.log(e)
  }
};
// 存入数据库中
async function saveBook(data) {
  try {
    for (let i = 0; i < data.length; i++) {
      // 去重
      const { aid, title } = data[i];
      const isBook = await _Books.find({
        aid,
        title
      })
      console.clear()
      console.log(i)
      if (isBook.length !== 0) {
        continue
      }
      const booksCount = await _Books.countDocuments()
      // await new
      const newBook = await new _Books({
        index: booksCount,
        ...data[i]
      })
      await newBook.save()
    }
  } catch (e) {
    console.log(e)
  }
};
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
    book_list.shift()
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
    console.log(e)
  }
};

// 获取每一本书的章节简介
// getChapters();
async function getChapters() {
  try {
    let index = 0
    // get book list
    const books = await _Books.find({ source: '笔趣阁' });
    const len = books.length
    // const len = 1
    // 打开网页
    const browser = await puppeteer.launch({
      headless: false,
      timeout: 300000,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await goto()
    // 处理获取到的a标签
    async function goto() {
      try {
        if (index < len) {
          await page.goto(books[index].href);
          // avatar
          const avatar = await page.$eval('#fmimg > img', el => el.src)
          // intro
          const intro = await page.$eval('#intro', el => el.innerHTML)
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
          const update = await _Books.updateOne({ aid: books[index].aid, index: books[index].index }, {
            '$set': {
              // chapters: chapters,
              avatar: avatar,
              intro: intro,
            }
          });
          setTimeout(async () => {
            console.log(index)
            // console.log(intro)
            index++
            await goto();
          }, 10)
        } else {
          // 关闭浏览器
          await browser.close();
        }
      } catch (e) {
        console.log(e)
      }
    }
  } catch (e) {
    console.log(e)
  }
}

// 根据传入的aid创建书籍
async function getAidCreateBook(aid) {
  try {
    const book_url = `https://www.biquge.com.cn/book/${aid}`
    // 打开网页
    const browser = await puppeteer.launch({
      // headless: false,
      timeout: 300000,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(books[index].href);
    const title = await page.$eval('info h1', el => el.innerText)
    // chapters
    const chapters = await page.$$eval('#list dd a', els => Array.from(els).map(el => {
      return {
        href: el.href,
        title: el.innerText
      }
    }))

    const isCreateBook = true;
    const isSetChapters = true;
    const books = await _Books.find({ aid, title })
    if (books !== 0) {
      for (let i = 0; i < books.length; i++) {
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
      }
    } else {

    }
  } catch (e) {
    console.log(e)
  }
}