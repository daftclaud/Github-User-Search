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

  currentPage = 1;
  lastPage = 9;
  stepSize = 3;
  lastBucketIndex = 2;
  bucketIndex = 0;

  constructor(private githubSvc: GithubService) {}

  ngOnInit() {}

  async search(query: string) {
    /*
      To-do:
        - add try/catch
        - paginate
    */
    const regex = /page=[0-9]+/g;
    const res = await this.githubSvc
      .searchUsers(query)
      .pipe(take(1))
      .toPromise();
    this.remainingRequests = +res.headers.get('X-RateLimit-Remaining');
    this.resultCount = (res.body as any).total_count;
    this.results = (res.body as any).items;
    this.lastPage = +res.headers.get('link').match(regex)[1].split('=')[1];
  }

  previous() {
    this.currentPage--;
    if (this.currentPage < (this.bucketIndex * this.stepSize + 1)) {
      this.bucketIndex--;
    }
  }

  next() {
    this.currentPage++;
    if (this.currentPage > (this.bucketIndex * this.stepSize + 3)) {
      this.bucketIndex++;
    }
  }
}
