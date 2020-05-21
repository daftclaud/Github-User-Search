import { Component, OnInit } from '@angular/core';
import { GithubService, GitUser } from 'src/app/shared/services/github.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  query: string;
  resultCount: number;
  remainingRequests: number;
  results: GitUser[];

  lastPage: number;
  currentPage = 1;
  stepSize = 3;
  bucketIndex = 0;
  lastBucketIndex: number;

  constructor(private githubSvc: GithubService) {}

  ngOnInit() {}

  async search(query: string) {
    /*
      To-do:
        - add try/catch
        - paginate
    */
    this.query = query;
    const regex = /page=[0-9]+/g;
    const res = await this.githubSvc
      .searchUsers(query)
      .pipe(take(1))
      .toPromise();
    this.remainingRequests = +res.headers.get('X-RateLimit-Remaining');
    this.resultCount = (res.body as any).total_count;
    this.results = (res.body as any).items;
    this.lastPage = +res.headers.get('link').match(regex)[1].split('=')[1];
    this.lastBucketIndex = Math.ceil(this.resultCount / this.stepSize) - 1;
  }

  previous() {
    this.currentPage--;
    if (this.currentPage < this.bucketIndex * this.stepSize + 1) {
      this.bucketIndex--;
    }
  }

  async next() {
    this.currentPage++;
    if (this.currentPage > this.bucketIndex * this.stepSize + 3) {
      this.bucketIndex++;
    }
    const res = await this.githubSvc
      .searchUsers(this.query, this.currentPage)
      .pipe(take(1))
      .toPromise();
    this.results = this.results.concat((res.body as any).items);
  }
}
