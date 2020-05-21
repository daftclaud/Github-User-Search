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
  login: 'daftclaud';
  node_id: 'MDQ6VXNlcjE3MjU4MzQx';
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

  searchUsers(query: string, page?: number) {
    const url = page ? this.baseURL + `/search/users?q=${query}&page=${page}` : this.baseURL + `/search/users?q=${query}`;
    return this.http.get(url, { observe: 'response' });
  }
}
