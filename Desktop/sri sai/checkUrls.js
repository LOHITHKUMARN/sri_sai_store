const https = require('https');

const urls = [
  "https://commons.wikimedia.org/wiki/Special:FilePath/Samsung_Logo.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/LG_logo_(2015).svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Whirlpool_Corporation_Logo_(as_of_2017).svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Bosch-Logo.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Voltas_logo.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Haier_logo.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Apple_logo_black.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_logo_2016.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/ASUS_Logo.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Sony_logo.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Philips_logo_new.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Panasonic_logo.svg"
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ url, error: e.message });
    });
  });
}

async function run() {
  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(res.status, url);
  }
}

run();
