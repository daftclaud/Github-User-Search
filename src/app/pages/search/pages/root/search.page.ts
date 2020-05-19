import { Component, OnInit } from '@angular/core';
import { GithubService, GitUser } from 'src/app/shared/services/github.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  resultCount: number;
  remainingRequests: number;
  results: GitUser[];

  constructor(
    private githubSvc: GithubService
  ) { }

  ngOnInit() {
  }

  async search(query: string) {
    const res = await this.githubSvc.searchUsers(query).pipe(take(1)).toPromise();
    this.remainingRequests = +res.headers.get('X-RateLimit-Remaining');
    this.resultCount = (res.body as any).total_count;
    this.results = (res.body as any).items;
    console.log('remaing requests: ', res.headers.get('X-RateLimit-Remaining'));
    console.log('body: ', res.body);
  }

}
