'use strict';
const puppeteer = require('puppeteer');
const fs = require('fs');
const progress = require('progress');
const _Biquge = require('../../model/biquge.js');
const _Biquge_Chapters = require('../../model/biquge_chapters.js');
// 获取单个书籍的章节数据
// https://m.boquge.com/wapbook/701-1.html
// getBookChapters('5e080ff356b1e420afa71252');
async function getBookChapters(open_id = '5e080ff356b1e420afa7124f') {
	try {
		const book = await _Biquge.findOne({ open_id });
		let { href } = book;
		href = href.replace('.html', '-1.html');
		// 打开网页
		const browser = await puppeteer.launch({
			headless: false,
			timeout: 0,
		});
		const page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 800 });
		// 开始收集章节数据数据;
		await getNextPage(href);

		async function getNextPage(url) {
			try {
				// 打开网页
				await page.goto(url);
				await page.waitForSelector('#pager > a');
				const nextPage = await page.$$eval('#pager > a', els =>
					Array.from(els).map(el => {
						return {
							title: el.innerText,
							href: el.href,
						};
					}),
				);
				// 获取当前页的列表数据
				const chapterList = await getChapterList(page);
				// 存入数据库中
				if (book.chapters.length === 0) {
					// 当章节数为0时
					book.chapters = chapterList;
					await _Biquge.updateOne({ open_id }, { $set: book });
				} else {
					// 当书籍中的章节数超过0时，去重，添加数据
					const chaptersStr = JSON.stringify(book.chapters);
					for (let i = 0; i < chapterList.length; i++) {
						if (chaptersStr.indexOf(chapterList[i].title) < 0) {
							book.chapters.push(chapterList[i]);
						}
					}
					await _Biquge.updateOne({ open_id }, { $set: book });
				}
				// 下一页
				const isNext = isNextPage(nextPage);
				if (isNext) {
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
		console.log(e);
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
// 提取章节列表数据
async function getChapterList(page) {
	try {
		const aid = await page.$eval('#pager > a:nth-child(1)', el =>
			el.href.replace(/(https.*wapbook\/)|(-.*\.html)/g, ''),
		);
		return await page.$$eval('#chapterlist li a', els =>
			Array.from(els).map(el => {
				return {
					aid,
					href: el.href,
					title: el.innerText,
					cid: Number.parseInt(el.href.replace(/(http.*_)|(\.html)/g, '')),
				};
			}),
		);
	} catch (e) {
		console.log(e);
	}
}
/*books();

async function books() {
	try {
		const books = await _Biquge.find({ source: 'boquge' });
		// 打开网页
		const browser = await puppeteer.launch({
			// executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
			// headless: false,
			timeout: 0,
		});
		const page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 800 });

		for (let i = 0; i < books.length; i++) {
			const book_id = books[i].open_id;
			const chapters = books[i].chapters;
			for (let c = 0; c < chapters.length; c++) {
				const { href, cid, title } = books[i].chapters[j];
				await page.goto(href);
				const title = await page.$eval('h1', el => el.innerText);
				const cContent = await page.$eval('#cContent', el => el.innerHTML);

			}
		}
	} catch (e) {
		console.log(e);
	}
}
*/

getChapter();

async function getChapter() {
	try {
		const books = await _Biquge.find({ source: 'boquge' });
		const len = books.length;
		let index = fs.readFileSync('./index', 'utf8');
		let cIndex = fs.readFileSync('./cIndex', 'utf8');
		index = Number.parseInt(index);
		cIndex = Number.parseInt(cIndex);
		let book_id = books[index].open_id;
		// 打开网页
		const browser = await puppeteer.launch({
			headless: false,
			timeout: 0,
		});
		const page = await browser.newPage();
		goto(books[index].chapters);
		async function goto(data) {
			try {
				const bar = new progress(index + ': [:bar] :current/:total', {
					total: data.length - cIndex,
					width: 50,
				});

				for (let c = cIndex; c < data.length; c++) {
					fs.writeFileSync('cIndex', c);
					const { cid, href } = data[c];
					const oldChapters = await _Biquge_Chapters.find({ book_id, cid });
					await bar.tick();
					if (oldChapters.length > 0) continue;
					await page.goto(href);
					await page.waitForSelector('#content > h1');
					const title = await page.$eval('#content > h1', el => el.innerText);
					const content = await page.$eval('#cContent', el => el.innerHTML);
					const newBook = await new _Biquge_Chapters({
						book_id,
						cid,
						title,
						href,
						content,
					});
					await newBook.save();
				}
				if (bar.complete) {
					index++;
					cIndex = 0;
					book_id = books[index].open_id;
					fs.writeFileSync('cIndex', cIndex);
					fs.writeFileSync('index', index);

					goto(books[index].chapters);

					// getChapter();
				}
			} catch (e) {
				if (e.message === 'Navigation timeout of 30000 ms exceeded') {
					getChapter();
				} else {
					console.log('test1', e);
				}
			}
		}
	} catch (e) {
		if (e.message === 'Navigation timeout of 30000 ms exceeded') {
			getChapter();
		} else {
			console.log('test2', e);
		}
	}
}

// 纠错
// SelfCheck();
async function SelfCheck() {
	try {
		const books = await _Biquge.find({ source: 'boquge' });
		const chapters = await _Biquge_Chapters.find({
			book_id: '5e080ff356b1e420afa71249',
		});

		for (let i = 0; i < books.length; i++) {
			const book_id = books[i].open_id;
			for (let c = 0; c < books[i].chapters.length; c++) {
				let chapter = books[i].chapters[c];
				const { title, cid } = chapter;
				for (let o = 0; o < chapters.length; o++) {
					if (title === chapters[o].title && cid === chapters[o].cid) {
						await _Biquge_Chapters.updateOne(
							{
								_id: chapters[o]._id,
							},
							{
								$set: {
									book_id,
								},
							},
						);
					}
				}
			}
		}
	} catch (e) {
		console.log(e);
	}
}
