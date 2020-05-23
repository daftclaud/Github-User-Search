import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface SearchOptions {
  query: string;
  repositories?: number;
  followers?: number;
  joined?: string; // YYYY-MM-DD
  location?: string;
  order?: 'desc' | 'asc';
}

export interface GitUser {
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

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private baseURL = 'https://api.github.com';

  constructor(private http: HttpClient) {}

  searchUsers(query: string, page?: number, itemsPerPage?: number) {
    // let url = page ? this.baseURL + `/search/users?q=${query}&page=${page}` : this.baseURL + `/search/users?q=${query}`;
    let url = this.baseURL + `/search/users?q=${query}`;
    if (page) {
      url = url.concat(`&page=${page}`);
    }
    if (itemsPerPage) {
      url = url.concat(`&per_page=${itemsPerPage}`);
    }
    return this.http.get(url, { observe: 'response' });
  }
}
