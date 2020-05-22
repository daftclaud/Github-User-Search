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
    if (multiplier) {
      this.currentPage++;
    }
    const res = await this.githubSvc
      .searchUsers(
        this.query,
        this.currentPage,
        multiplier ? this.itemsPerPage * multiplier : this.itemsPerPage
      )
      .pipe(take(1))
      .toPromise();
    this.remainingRequests = +res.headers.get('X-RateLimit-Remaining');
    this.results = this.results
      ? this.results.concat((res.body as any).items)
      : (res.body as any).items;
    return res;
  }

  // To-do: debounce search button
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
    const linkHeader = res.headers.get('link');
    this.lastPage = linkHeader ? +linkHeader.match(regex)[1].split('=')[1] : null;
    this.lastBucketIndex = Math.ceil(this.lastPage / this.stepSize) - 1;
  }

  async previous() {
    this.currentPage--;
    if (this.currentPage < this.bucketIndex * this.stepSize + 1) {
      this.bucketIndex--;
    }
    const scrollAmount = this.itemHeight * this.itemsPerPage;
    await this.content.scrollByPoint(null, -scrollAmount, 2000);
  }

  async next(event?) {
    await this.getItems(1);
    if (event) {
      event.target.complete();
    }
    if (this.currentPage > this.bucketIndex * this.stepSize + 3) {
      this.bucketIndex++;
    }
    if (!event) {
      const scrollAmount = this.itemHeight * this.itemsPerPage;
      await this.content.scrollByPoint(null, scrollAmount, 2000);
    }
  }

  async goToPage(page: number) {
    if (page === this.currentPage) {
      return;
    }
    /**
     * If going forward, first check if you already have the items.
     * If going backward, just scroll.
     * If going to first or last page refresh items
     */
    if (page === this.lastPage) {
      this.currentPage = this.lastPage;
      this.bucketIndex = this.lastBucketIndex;
      this.results = null;
      this.getItems();
    } else if (page === 1) {
      this.currentPage = 1;
      this.bucketIndex = 0;
      this.results = null;
      this.getItems();
    }
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
    await this.content.scrollByPoint(null, scrollAmount, 2000);
  }

  private alreadyGotItems(page: number) {
    return this.results.length >= this.itemsPerPage * page;
  }
}
