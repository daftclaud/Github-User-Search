import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';

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

@Injectable({
  providedIn: 'root',
})
export class GithubService {

  constructor(
    private fun: AngularFireFunctions
  ) {}

  searchUsers(query: string, page?: number, itemsPerPage?: number) {
    const searchUsers = this.fun.httpsCallable('searchUsers');
    return searchUsers({query, page, itemsPerPage}).toPromise();
  }
}
