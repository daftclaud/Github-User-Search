import * as functions from 'firebase-functions';
import cheerio = require('cheerio');
import axios = require('axios');

async function fetchHTML(url: string) {
  const { data } = await axios.default.get(url);
  return cheerio.load(data);
}

export interface NotableInfo {
    name?: string;
    description?: string;
    starCount?: number;
    followerCount?: number;
    location?: string;
    email?: string;
}

export const getNotableInfo = functions.https.onCall(async (data, context) => {
  const urls = data.urls as string[];
  const info: NotableInfo[] = [];

  urls.forEach(async (url) => {
      const $ = await fetchHTML(url);
      const name = $("[itemprop='name']").text();
      const description = $('div.p-note user-profile-bio mb-2 js-user-profile-bio > div').text();
      const stars = $('#js-pjax-container > div > div.col-lg-9.col-md-8.col-12.float-md-left.pl-md-2 > div.UnderlineNav.width-full.user-profile-nav.js-sticky.top-0 > nav > a:nth-child(5) > span');

      info.push({
          name,
          description,
          starCount: +stars
      })
  });
  return info;
});
