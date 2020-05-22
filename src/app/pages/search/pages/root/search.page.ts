import { Component, OnInit, ViewChild } from '@angular/core';
import { GithubService, GitUser } from 'src/app/shared/services/github.service';
import { take } from 'rxjs/operators';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';

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
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(private githubSvc: GithubService) {}

  ngOnInit() {}

  /**
   * no item highlight sometimes
   */

  getFirstItemIndex() {
    const index = !(this.results.length % this.itemsPerPage) ?
    Math.floor((this.results.length - 1) / this.itemsPerPage) * this.itemsPerPage :
    Math.floor(this.results.length / this.itemsPerPage) * this.itemsPerPage;
    return index;
  }

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
    let items = (res.body as any).items;

    /**
     * This takes care of a 'bug' where the github api returns less items than it was asked for.
     * It usually happens when there aren't many results (~300).
     */
    if (multiplier && items.length < this.itemsPerPage * multiplier) {
      const pt1 = await this.githubSvc
      .searchUsers(
        this.query,
        this.currentPage - 1,
        this.itemsPerPage
      )
      .pipe(take(1))
      .toPromise();
      const pt2 = await this.githubSvc
      .searchUsers(
        this.query,
        this.currentPage,
        this.itemsPerPage
      )
      .pipe(take(1))
      .toPromise();
      items = (pt1.body as any).items.concat((pt2.body as any).items);
    }
    this.remainingRequests = +res.headers.get('X-RateLimit-Remaining');
    this.results = this.results
      ? this.results.concat(items)
      : items;
    return res;
  }

  // To-do: debounce search button
  async search(query: string) {
    /*
      To-do:
        - add try/catch
        - paginate
    */
    if (this.query && this.query === query) { return; }
    this.currentPage = 1;
    this.query = query;
    const regex = /&page=[0-9]+/g;
    const res = await this.getItems();
    this.remainingRequests = +res.headers.get('X-RateLimit-Remaining');
    this.resultCount = (res.body as any).total_count;
    this.results = (res.body as any).items;
    const linkHeader = res.headers.get('link');
    this.lastPage = linkHeader ? +linkHeader.match(regex)[1].split('=')[1] : null;
    this.lastBucketIndex = Math.ceil(this.lastPage / this.stepSize) - 1;
    await this.content.scrollToTop();
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
      console.log(this.currentPage);
      this.bucketIndex = this.lastBucketIndex;
      this.results = null;
      await this.getItems();
    } else if (this.bucketIndex > 0 && page === 1) {
      this.currentPage = 1;
      this.bucketIndex = 0;
      this.results = null;
      await this.getItems();
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
    console.log('scrolling by ', itemsToScroll, ' items');
    this.currentPage = page;
    await this.content.scrollByPoint(null, scrollAmount, 2000);
  }

  private alreadyGotItems(page: number) {
    return this.results.length >= this.itemsPerPage * page;
  }
}
