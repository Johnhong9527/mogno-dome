'use strict';
const puppeteer = require('puppeteer');
const fs = require('fs');
const progress = require('progress');
const _Biquge = require('../../model/biquge.js');
const _Biquge_Chapters = require('../../model/biquge_chapters.js');
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
					book_id = books[index].open_id;
					fs.writeFileSync('cIndex', 0);
					fs.writeFileSync('index', index);
					goto(books[index].chapters);
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
