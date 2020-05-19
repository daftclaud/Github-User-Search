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

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  private baseURL = 'https://api.github.com';

  constructor(
    private http: HttpClient
  ) { }

  searchUsers(query: string) {
    const url = this.baseURL + `/search/users?q=${query}`;
    return this.http.get(url);
  }
}
