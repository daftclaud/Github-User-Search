import * as functions from 'firebase-functions';
import cheerio = require('cheerio');
import axios = require('axios');

export interface NotableInfo {
    name?: string;
    description?: string;
    starCount?: string;
    followerCount?: string;
    location?: string;
    email?: string;
}

async function fetchHTML(url: string) {
  const { data } = await axios.default.get(url);
  return cheerio.load(data);
}

async function parseProfile(url: string) {
  return new Promise<NotableInfo>(async (res, rej) => {
    const $ = await fetchHTML(url);
      const name = $("[itemprop='name']").text();
      const description = $('#js-pjax-container > div > div.h-card.col-lg-3.col-md-4.col-12.float-md-left.pr-md-3.pr-xl-6 > div.d-none.d-md-block > div > div.p-note.user-profile-bio.mb-2.js-user-profile-bio > div').text().trim();
      const starCount = $('#js-pjax-container > div > div.col-lg-9.col-md-8.col-12.float-md-left.pl-md-2 > div.UnderlineNav.width-full.user-profile-nav.js-sticky.top-0 > nav > a:nth-child(5) > span').text().trim();
      const followerCount = $('#js-pjax-container > div > div.col-lg-9.col-md-8.col-12.float-md-left.pl-md-2 > div.UnderlineNav.width-full.user-profile-nav.js-sticky.top-0 > nav > a:nth-child(6) > span').text().trim();
      const location = $('#js-pjax-container > div > div.h-card.col-lg-3.col-md-4.col-12.float-md-left.pr-md-3.pr-xl-6 > div.d-none.d-md-block > div > ul > li:nth-child(2) > span').text().trim();
      const email = $('#js-pjax-container > div > div.h-card.col-lg-3.col-md-4.col-12.float-md-left.pr-md-3.pr-xl-6 > div.d-none.d-md-block > div > ul > li:nth-child(3) > a').text().trim();
      res({
        name,
        description,
        starCount,
        followerCount,
        location,
        email
      })
  })
}

export const getNotableInfo = functions.https.onCall(async (data, context) => {
  const urls = data.urls as string[];
  // const info: NotableInfo[] = [];
  const promises: Promise<NotableInfo>[] = [];

  urls.forEach(async (url) => {
      promises.push(parseProfile(url));
  });
  return Promise.all(promises);
});
