import { Component, OnInit, ViewChild } from '@angular/core';
import { GithubService, GitUser } from 'src/app/shared/services/github.service';
import { take } from 'rxjs/operators';
import { IonContent } from '@ionic/angular';

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

  itemsPerPage = 30;
  lastPage: number;
  currentPage = 1;
  stepSize = 3;
  bucketIndex = 0;
  lastBucketIndex: number;

  itemHeight = 44;

  @ViewChild(IonContent) content: IonContent;

  constructor(private githubSvc: GithubService) {}

  ngOnInit() {}

  async getItems(multiplier?: number) {
    const res = await this.githubSvc
      .searchUsers(this.query, this.currentPage, multiplier ? this.itemsPerPage * multiplier : this.itemsPerPage)
      .pipe(take(1))
      .toPromise();
    this.results = this.results ? this.results.concat((res.body as any).items) : (res.body as any).items;
    return res;
  }

  async search(query: string) {
    /*
      To-do:
        - add try/catch
        - paginate
    */
    this.query = query;
    const regex = /&page=[0-9]+/g;
    const res = await this.getItems();
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
    await this.getItems();
    await this.content.scrollToPoint(
      null,
      this.itemHeight * this.itemsPerPage,
      2000
    );
  }

  async goToPage(page: number) {
    if (page === this.currentPage) {
      return;
    }
    /**
     * If going forward, first check if you already have the items.
     * If going backward, just scroll.
     */
    const diff = page - this.currentPage;
    const direction = diff > 0 ? 1 : -1;
    if (direction > 0) {
      // Going forward
      if (!this.alreadyGotItems(page)) {
        console.log('getting more');
        this.currentPage = page;
        await this.getItems(diff);
      }
    }
    const itemsToScroll = diff * this.itemsPerPage;
    const scrollAmount = this.itemHeight * itemsToScroll;
    this.currentPage = page;
    await this.content.scrollByPoint(
      null,
      scrollAmount,
      2000
    );
  }

  private alreadyGotItems(page: number) {
    return this.results.length >= this.itemsPerPage * page;
  }
}
