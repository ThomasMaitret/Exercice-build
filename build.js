const fs = require('fs-extra');
const path = require('path');
const del = require('del');
const md5 = require('md5');
const UglifyJS = require('uglify-es');

const distPath = path.resolve(__dirname, 'dist');
const srcPath = path.resolve(__dirname, 'src');
const horlogeJsPath = path.resolve(srcPath, 'js', 'horloge.js');
const indexJsPath = path.resolve(srcPath, 'js', 'index.js');
const indexHtmlPath = path.resolve(srcPath, 'index.html');
const indexHtmlDistPath = path.resolve(distPath, 'index.html');
const appJsDistPath = path.resolve(distPath, 'app.js');

(async () => {
  try {
    try {
      const stats = await fs.stat(distPath);

      if (!stats.isDirectory()) {
        await fs.unlink(distPath);
        await fs.mkdir(distPath);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      await fs.mkdir(distPath);
    }

    await del(distPath);
    await fs.mkdir(distPath);

    const dataHorloge = await fs.readFile(horlogeJsPath);
    await fs.appendFile(appJsDistPath, dataHorloge);

    const dataIndex = await fs.readFile(indexJsPath);
    await fs.appendFile(appJsDistPath, dataIndex);

    const dataIndexHtml = await fs.readFile(indexHtmlPath);
    await fs.appendFile(indexHtmlDistPath, dataIndexHtml);

    // Change script tags

    await fs.rename(
      appJsDistPath,
      path.resolve(distPath, `app.${md5(appJsDistPath)}.js`)
    );

    // Uglify
  } catch (err) {
    console.log(err.message);
  }
})();
