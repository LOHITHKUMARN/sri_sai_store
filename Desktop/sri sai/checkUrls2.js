const https = require('https');

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

const urls = [
  "https://commons.wikimedia.org/wiki/Special:FilePath/Bosch_logo.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Haier_logo.svg",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Sony_logo.svg"
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, options, (res) => {
      resolve({ url, status: res.statusCode, location: res.headers.location });
    }).on('error', (e) => {
      resolve({ url, error: e.message });
    });
  });
}

async function run() {
  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(res.status, url, res.location || '');
  }
}

run();
