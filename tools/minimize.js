const fs       = require('fs').promises;
const CleanCSS = require('clean-css');

(async () => {
  const input   = await fs.readFile('../src/stylent.css');
  const options = { level: 2 };
  const output  = new CleanCSS(options).minify(input);
  await fs.writeFile('../src/stylent.min.css', output.styles);
  console.log(output.stats.originalSize, 'to', output.stats.minifiedSize)
})()
