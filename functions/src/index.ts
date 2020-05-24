import * as functions from 'firebase-functions';
import cheerio = require('cheerio');
import axios = require('axios');

export interface GitUser {
  info?: NotableInfo;
  avatar_url: string;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: '';
  html_url: string;
  id: number;
  login: string;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  score: number;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
}

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

/**
 * 
 * @param url 
 * 
 * Parses the user profile page for their notable info
 */
async function parseProfile(url: string) {
  return new Promise<NotableInfo>(async (res, rej) => {
    const $ = await fetchHTML(url);
    const name = $("[itemprop='name']").text();
    const description = $(
      '#js-pjax-container > div > div.h-card.col-lg-3.col-md-4.col-12.float-md-left.pr-md-3.pr-xl-6 > div.d-none.d-md-block > div > div.p-note.user-profile-bio.mb-2.js-user-profile-bio > div'
    )
      .text()
      .trim();
    const starCount = $(
      '#js-pjax-container > div > div.col-lg-9.col-md-8.col-12.float-md-left.pl-md-2 > div.UnderlineNav.width-full.user-profile-nav.js-sticky.top-0 > nav > a:nth-child(5) > span'
    )
      .text()
      .trim();
    const followerCount = $(
      '#js-pjax-container > div > div.col-lg-9.col-md-8.col-12.float-md-left.pl-md-2 > div.UnderlineNav.width-full.user-profile-nav.js-sticky.top-0 > nav > a:nth-child(6) > span'
    )
      .text()
      .trim();
    const location = $(
      '#js-pjax-container > div > div.h-card.col-lg-3.col-md-4.col-12.float-md-left.pr-md-3.pr-xl-6 > div.d-none.d-md-block > div > ul > li:nth-child(2) > span'
    )
      .text()
      .trim();
    const email = $(
      '#js-pjax-container > div > div.h-card.col-lg-3.col-md-4.col-12.float-md-left.pr-md-3.pr-xl-6 > div.d-none.d-md-block > div > ul > li:nth-child(3) > a'
    )
      .text()
      .trim();
    res({
      name,
      description,
      starCount,
      followerCount,
      location,
      email,
    });
  });
}

/**
 *
 * @param query
 * @param page
 * @param itemsPerPage
 *
 * Returns users, remaining requests, result count
 */
async function getUsers(query: string, page?: number, itemsPerPage?: number) {
  const baseURL = 'https://api.github.com';
  let url = baseURL + `/search/users?q=${query}`;
  if (page) {
    url = url.concat(`&page=${page}`);
  }
  if (itemsPerPage) {
    url = url.concat(`&per_page=${itemsPerPage}`);
  }
  const { data, headers } = await axios.default.get(url);
  return {
    data,
    headers,
  };
}

export const searchUsers = functions.https.onCall(async (data, context) => {
  const { query, page, itemsPerPage } = data;
  const {data: res, headers} = await getUsers(query, page, itemsPerPage);
  const users = res.items as GitUser[]
  const urls = users.map(user => user.html_url);
  const promises: Promise<NotableInfo>[] = [];

  urls.forEach(async (url) => {
    promises.push(parseProfile(url));
  });
  const info = await Promise.all(promises);
  users.forEach((user, index) => user.info = info[index]);
  return {
    users,
    resultCount: res.total_count,
    remaining: headers['x-ratelimit-remaining']
  }
});
