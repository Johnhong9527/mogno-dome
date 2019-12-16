const mongoose = require('mongoose');
const _Books = require('./model/books.js');
const _Storybl = require('./model/storybl.js');
const _Chapters = require('./model/chapters.js');


// createBook()
// createChapter()
// const index = 2;

async function createBook() {
  try {
    const storybl = await _Storybl.find({});
    const books = await _Books.find({});
    let chapters = [];
    const list = storybl[index].list;
    Object.keys(list).forEach(el => {
      chapters.push({
        cid: list[el].cid,
        title: list[el].chapter.title,
        href: list[el].href,
        aid: list[el].aid,
      })
    })
    const new_book = await new _Books({
      index: books.length,
      aid: storybl[index].aid,
      title: storybl[index].title,
      author: storybl[index].user,
      chapters
    })
    new_book.save()
  } catch (e) {
    console.log(e)
  }
}

async function createChapter() {
  try {
    const storybl = await _Storybl.find({});
    const book = await _Books.findOne({ aid: storybl[index].aid });
    const list = storybl[index].list;
    for (let i = 0; i < list.length; i++) {
      const new_chapter = await new _Chapters({
        index: book.index,
        aid: list[i].aid,
        cid: list[i].cid,
        href: list[i].href,
        title: list[i].chapter.title,
        content: list[i].chapter.chapter,
      })
      await new_chapter.save();
      console.log(i)
    }
  } catch (e) {
    console.log(e)
  }
}