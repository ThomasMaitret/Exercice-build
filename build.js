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

async function build() {
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

    // Delete dist directory
    await del(distPath);
    await fs.mkdir(distPath);

    // Build app.js
    const dataHorloge = await fs.readFile(horlogeJsPath);
    await fs.appendFile(appJsDistPath, dataHorloge);

    const dataIndex = await fs.readFile(indexJsPath);
    await fs.appendFile(appJsDistPath, dataIndex);

    // Replace script tags
    const dataIndexHtml = await fs.readFile(indexHtmlPath, 'utf8');
    let newDataIndexHtml = dataIndexHtml.replace(
      '<script src="./js/horloge.js"></script>',
      '<script src="./app.js"></script>'
    );
    newDataIndexHtml = newDataIndexHtml.replace(
      '<script src="./js/index.js"></script>',
      ''
    );
    await fs.appendFile(indexHtmlDistPath, newDataIndexHtml);

    // Uglify
    const dataDistAppJs = await fs.readFile(appJsDistPath, 'utf8');
    const newDataDistAppJs = UglifyJS.minify(dataDistAppJs);
    await fs.writeFile(appJsDistPath, newDataDistAppJs.code);

    // Rename with hash
    const newAppJsDistPath = `app.${md5(appJsDistPath)}.js`;
    await fs.rename(appJsDistPath, path.resolve(distPath, newAppJsDistPath));
  } catch (err) {
    console.log(err.message);
  }
}

build();
