'use strict';
// 剥离混乱数据
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-core');
const fs = require('fs');
const progress = require('progress');
const _Books = require('./model/books.js');
const _Biquge = require('./model/biquge.js');
const _Chapters = require('./model/chapters.js');
const _Biquge_Chapters = require('./model/biquge_chapters.js');
create();
async function create() {
	try {
		let newBook = [];
		const books = await _Books.find({});
		for (let i = 0; i < books.length; i++) {
			if (books[i].source === 'boquge') {
				newBook.push({
					index: books[i].index,
					tag: books[i].tag,
					tag_url: books[i].tag_url,
					source: books[i].source,
					aid: books[i].aid,
					title: books[i].title,
					href: books[i].href,
					author: books[i].author,
					lastUpdate: books[i].lastUpdate,
					status: books[i].status,
					intro: books[i].intro,
					avatar: books[i].avatar,
					chapters: books[i].chapters,
				});
			}
		}
		for (let i = 0; i < newBook.length; i++) {
			newBook[i].index = i + 1;
			let biquge = await _Biquge(newBook[i]);
			biquge.open_id = biquge._id;
			await biquge.save();
			console.log(i);
		}
		// process.exit();
	} catch (e) {
		console.log(e.message);
	}
}
// mvall();
async function mvall() {
	try {
		const old_books = await _Biquge.find({ source: 'boquge' });
		for (let i = 37; i < old_books.length; i++) {
			await moveChapter(old_books[i].aid);
		}
	} catch (e) {}
}

// moveChapter(23768);
async function moveChapter(aid = 26583) {
	try {
		let book = await _Biquge.findOne({ aid });
		let chapters = book.chapters;
		for (let i = 0; i < chapters.length; i++) {
			let chapter = await _Chapters.findOne({
				aid: chapters[i].aid,
				cid: chapters[i].cid,
			});
			if (chapter.title) {
				let new_chapter = {
					title: chapter.title,
					book_id: book.open_id,
					cid: chapter.cid,
					href: chapter.href,
					index: i + 1,
					content: chapter.content,
				};
				let isSave = await _Biquge_Chapters.find({
					cid: chapter.cid,
					book_id: book.open_id,
				});
				if (isSave.length === 0) {
					let save = await _Biquge_Chapters({ ...new_chapter });
					await save.save();
				}
			} else {
				console.log(chapter);
				return;
			}

			console.log(i);
		}
	} catch (e) {
		console.log(e);
	}
}
