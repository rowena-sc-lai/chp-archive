const fs = require('fs');
const request = require('request');
const moment = require('moment-timezone');
const mkdirp = require('mkdirp');
const path = require('path');

// https://www.chp.gov.hk/files/pdf/building_list_chi.pdf
// https://www.chp.gov.hk/files/pdf/building_list_eng.pdf
// https://www.chp.gov.hk/files/pdf/flights_trains_tc.pdf
// https://www.chp.gov.hk/files/pdf/flights_trains_en.pdf



const downloadPdf = async (folder, filename, url) => {
  await new Promise((resolve, reject) => {
    mkdirp.sync(folder);
    const file = fs.createWriteStream(path.join(folder, filename));
    request({
      /* Here you should specify the exact link to the file you are trying to download */
      uri: url,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
      },
      /* GZIP true for most of the websites now, disable it if you don't need it */
      gzip: true
    })
      .pipe(file)
      .on('finish', () => {
        console.log(`The file is finished downloading.`);
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      })

  })
}

const generateHtml = () => {
  const folders = fs.readdirSync('data');
  const paths = [];
  folders.forEach(dir => {
    const dateDir = fs.readdirSync('data/' + dir);
    dateDir.forEach(file => {
      paths.push({
        date: dir,
        file,
        path: `data/${dir}/${file}`
      });
    })
  })

  const html = `<ul>${paths.map(p => `<li><a href="${p.path}">${p.date}/${p.file}</a></li>`).join('')}</ul>`
  fs.writeFileSync('index.html', fs.readFileSync('index.html.template').toString().replace('__TEMPLATE__', html));
}

const run = async () => {
  const today = moment().tz("Asia/Hong_Kong").format('YYYY-MM-DD');
  await downloadPdf(`data/${today}`, 'building_list_chi.pdf', 'https://www.chp.gov.hk/files/pdf/building_list_chi.pdf');
  await downloadPdf(`data/${today}`, 'building_list_eng.pdf', 'https://www.chp.gov.hk/files/pdf/building_list_eng.pdf');
  await downloadPdf(`data/${today}`, 'flights_trains_tc.pdf', 'https://www.chp.gov.hk/files/pdf/flights_trains_tc.pdf');
  await downloadPdf(`data/${today}`, 'flights_trains_en.pdf', 'https://www.chp.gov.hk/files/pdf/flights_trains_en.pdf');
  generateHtml();
}

// don't cache. throw the error to let travis know
run();