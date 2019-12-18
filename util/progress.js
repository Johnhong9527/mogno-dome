// node-progress

/**
 * Options
 * These are keys in the options object you can pass to the progress bar along with total as seen in the example above.
 * (这些是选项对象中的键，您可以将其与总数一起传递到进度条，如上例所示。)
 * *******************************************************************************
 * curr --> current completed index(当前完成的索引)
 * total --> total number of ticks to complete(需要完成的总滴答数)
 * width --> the displayed width of the progress bar defaulting to total(进度条的显示宽度默认为总计)
 * stream --> the output stream defaulting to stderr(默认为stderr的输出流)
 * head --> head character defaulting to complete character(头字符默认为完整字符)
 * complete --> completion character defaulting to "="(已完成的字符，默认为“ =“)
 * incomplete --> incomplete character defaulting to "-"(待完成的字符，默认为“-”)
 * renderThrottle --> minimum time between updates in milliseconds defaulting to 16(更新之间的最短间隔（以毫秒为单位）默认为16)
 * clear --> option to clear the bar on completion defaulting to false(选项，以清除完成时的栏，默认为false)
 * callback --> optional function to call when the progress bar completes(进度条完成时调用的可选函数)
 */
/**
 * Tokens
 * These are tokens you can use in the format of your progress bar.
 * (您可以使用进度条格式的令牌。)
 * *******************************************************************************
 * :bar --> the progress bar itself(进度条本身)
 * :current --> current tick number(当前刻度号)
 * :total --> total ticks(总滴答数)
 * :elapsed --> time elapsed in seconds(经过的时间（以秒为单位）)
 * :percent --> completion percentage(完成率)
 * :eta --> estimated completion time in seconds(估计完成时间（以秒为单位）)
 * :rate --> rate of ticks per second(每秒滴答率)
 */
// const progress = require('progress');

// const bar = new progress('progress: [:bar]', {total: 5000, width: 70, complete: '*'});


// module.exports = ({total, title = 'progress: [:bar]'}) => new progress(`${title}`);
/*var timer = setInterval(function () {
  bar.tick(2);  //进度步长
  if (bar.complete) {
    console.log('\ncomplete\n');
    clearInterval(timer);
  }
}, 100);*/


