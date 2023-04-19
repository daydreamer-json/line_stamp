// This program used LINE Sticker content.
// ==========================================

const fs = require('fs');
const path = require('path');
const request = require('request');
const unzipper = require('unzipper');

const dl_id = '22670564';
const subDirectoryPath = 'resource_bk';
const urlOptions = {
  'baseUrl': 'https://stickershop.line-scdn.net/stickershop/v1',
  'packageName_Static': 'iphone/stickers@2x',
  'packageName_Dynamic': 'iphone/stickerpack@2x',
};
const regexOptions = {
  png: new RegExp('@2x\.png$', 'g'),
  m4a: new RegExp('\.m4a$', 'g'),
};

async function dl_zip_package (id) {
  let buildedPackageUrl = {
    'static': `${urlOptions.baseUrl}/product/${id}/${urlOptions.packageName_Static}.zip`,
    'dynamic': `${urlOptions.baseUrl}/product/${id}/${urlOptions.packageName_Dynamic}.zip`
  };
  let zipPath = {
    'static': `./${subDirectoryPath}/${id}_static.zip`,
    'dynamic': `./${subDirectoryPath}/${id}_dynamic.zip`
  };
  let extractPath = {
    'complete': `./${subDirectoryPath}/${id}`,
    'static': `./${subDirectoryPath}/${id}_static`,
    'dynamic': `./${subDirectoryPath}/${id}_dynamic`
  }
  fs.exists(extractPath.complete, (exists) => {
    if (!exists) {
      fs.mkdir(extractPath.complete, {recursive: true}, (err) => {
        if (err) throw err;
        console.log(`Folder created : ${extractPath.complete}`);
      });
    }
  });
  fs.exists(extractPath.static, (exists) => {
    if (!exists) {
      fs.mkdir(extractPath.static, {recursive: true}, (err) => {
        if (err) throw err;
        console.log(`Folder created : ${extractPath.static}`);
      });
    }
  });
  fs.exists(extractPath.dynamic, (exists) => {
    if (!exists) {
      fs.mkdir(extractPath.dynamic, {recursive: true}, (err) => {
        if (err) throw err;
        console.log(`Folder created : ${extractPath.dynamic}`);
      });
    }
  });
  await new Promise((resolve, reject) => {
    request(buildedPackageUrl.static)
      .pipe(fs.createWriteStream(zipPath.static))
      .on('finish', resolve)
      .on('error', reject);
  });
  await new Promise((resolve, reject) => {
    request(buildedPackageUrl.dynamic)
      .pipe(fs.createWriteStream(zipPath.dynamic))
      .on('finish', resolve)
      .on('error', reject);
  });
  const zipStaticSize = await new Promise((resolve, reject) => {
    fs.stat(zipPath.static, (err, stats) => {
      if (err) reject (err);
      else resolve (stats.size);
    });
  });
  const zipDynamicSize = await new Promise((resolve, reject) => {
    fs.stat(zipPath.dynamic, (err, stats) => {
      if (err) reject (err);
      else resolve (stats.size);
    });
  });
  if (zipStaticSize > 1024) {
    await new Promise((resolve, reject) => {
      fs.createReadStream(zipPath.static)
        .pipe(unzipper.Extract({path: extractPath.static}))
        .on('finish', resolve)
        .on('error', reject);
    });
    await new Promise((resolve, reject) => {
      fs.readdir(`${extractPath.static}`, (err, files) => {
        if (err) throw err;
        files.forEach(file => {
          const sourceFile = path.join(`${extractPath.static}`, file);
          const destinationFile = path.join(extractPath.complete, file);
          fs.rename(sourceFile, destinationFile, (err) => {
            if (err) throw err;
            console.log(`File moved : ${sourceFile} => ${destinationFile}`);
          });
        });
      });
    });
    await new Promise((resolve, reject) => {
      fs.exists(`${extractPath.complete}/productInfo.meta`, (exists) => {
        if (exists) {
          fs.rename(path.join(extractPath.complete, 'productInfo.meta'), path.join(extractPath.complete, 'productInfo.json'), (err) => {
            if (err) throw err;
            console.log(`File renamed : ${extractPath.complete}/productInfo.meta => ${extractPath.complete}/productInfo.json`);
          });
        }
      });
    });
  } else {
    console.log('File size is too small. Deleting ...');
  }
  if (zipDynamicSize > 1024) {
    await new Promise((resolve, reject) => {
      fs.createReadStream(zipPath.dynamic)
        .pipe(unzipper.Extract({path: extractPath.dynamic}))
        .on('finish', resolve)
        .on('error', reject);
    });
    await new Promise((resolve, reject) => {
      fs.exists(`${extractPath.dynamic}/sound`, (exists) => {
        if (exists) {
          fs.readdir(`${extractPath.dynamic}/sound`, (err, files) => {
            if (err) throw err;
            files.forEach(file => {
              const sourceFile = path.join(`${extractPath.dynamic}/sound`, file);
              const destinationFile = path.join(extractPath.complete, file);
              fs.rename(sourceFile, destinationFile, (err) => {
                if (err) throw err;
                console.log(`File moved : ${sourceFile} => ${destinationFile}`);
              });
            });
          });
        }
      });
    });
  } else {
    console.log('File size is too small. Deleting ...');
  }
  fs.exists(`${extractPath.static}`, (exists) => {
    if (exists) {
      fs.rmdir(extractPath.static, {recursive: true}, (err) => {
        if (err) throw err;
        console.log(`Folder deleted : ${extractPath.static}`);
      });
    }
  });
  fs.exists(`${extractPath.dynamic}`, (exists) => {
    if (exists) {
      fs.rmdir(extractPath.dynamic, {recursive: true}, (err) => {
        if (err) throw err;
        console.log(`Folder deleted : ${extractPath.dynamic}`);
      });
    }
  });
  fs.exists(`${zipPath.static}`, (exists) => {
    if (exists) {
      fs.unlink(zipPath.static, (err) => {
        if (err) throw err;
        console.log(`File deleted : ${zipPath.static}`);
      });
    }
  });
  fs.exists(`${zipPath.dynamic}`, (exists) => {
    if (exists) {
      fs.unlink(zipPath.dynamic, (err) => {
        if (err) throw err;
        console.log(`File deleted : ${zipPath.dynamic}`);
      });
    }
  });
}

dl_zip_package(dl_id);