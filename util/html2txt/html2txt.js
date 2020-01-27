const _Biquge = require('../../model/biquge.js');
const _Biquge_Chapters = require('../../model/biquge_chapters.js');
const htmlToText = require('html-to-text');
const fs = require('fs');
const progress = require('progress');
toText();
async function toText(open_id = '5e080ff356b1e420afa71249') {
	try {
		const books = await _Biquge.findOne({
			open_id,
		});
		const { chapters, author } = books;
		const book_name = books.title;
		const bar = new progress(book_name + ': [:bar] :current/:total', {
			total: chapters.length,
			width: 50,
		});
		for (let i = 0; i < chapters.length; i++) {
			await bar.tick();
			let { cid, title } = chapters[i];
			const chapter = await _Biquge_Chapters.findOne({
				cid,
				book_id: open_id,
				title,
			});
			const txt = await htmlToText.fromString(chapter.content);
			await fs.appendFileSync(
				`${book_name}-${author}.txt`,
				`###${title}\n${txt}\n\n`,
			);
		}
		if (bar.complete) {
			process.exit();
		}
	} catch (e) {
		console.log(e);
	}
}
