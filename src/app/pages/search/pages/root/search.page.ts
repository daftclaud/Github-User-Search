import { Component, OnInit, ViewChild } from '@angular/core';
import { GithubService, GitUser } from 'src/app/shared/services/github.service';
import { take } from 'rxjs/operators';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';
import { PaginationOutput } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  query: string;
  remainingRequests: number;
  resultCount: number;
  results: GitUser[];

  usersPerPage = 30;
  itemHeight = 44;

  @ViewChild(IonContent) content: IonContent;

  constructor(private githubSvc: GithubService) {}

  ngOnInit() {}

  onNavigate(args: PaginationOutput) {
    if (args.requestParams) {
      this.getItems(...args.requestParams);
    }

    switch (args.navEvent) {
      case 'next':
        this.scrollPage(this.usersPerPage, 'forward');
        break;
      case 'prev':
        this.scrollPage(this.usersPerPage, 'backward');
        break;
      case 'refresh':
        console.log('refresh');
        break;
    }
  }

  async getItems(page: number, itemsToGet: number, prepend: boolean) {
    const res = await this.githubSvc
      .searchUsers(
        this.query,
        page,
        itemsToGet || this.usersPerPage
      )
      .pipe(take(1))
      .toPromise();
    let items = (res.body as any).items;
    this.remainingRequests = +res.headers.get('X-RateLimit-Remaining');

    /**
     * This takes care of a 'bug' where the github api returns less items than it was asked for.
     * It usually happens when there aren't many results (~300).
     */
    if (itemsToGet && items.length < itemsToGet) {
      const pt1 = await this.githubSvc
        .searchUsers(this.query, page - 1, this.usersPerPage)
        .pipe(take(1))
        .toPromise();
      const pt2 = await this.githubSvc
        .searchUsers(this.query, page, this.usersPerPage)
        .pipe(take(1))
        .toPromise();
      items = (pt1.body as any).items.concat((pt2.body as any).items);
    }

    if (prepend) {
      this.results.unshift(...items);
      this.results = [...new Set(this.results)]; // removes duplicates
    } else {
      this.results = this.results ? this.results.concat(items) : items;
    }

    return res;
  }

  // To-do: debounce search button
  async search(query: string) {
    if (this.query && this.query === query) {
      return;
    }
    this.query = query;
    const res = await this.getItems(1, this.usersPerPage, false);
    this.resultCount = (res.body as any).total_count;
    if (this.results) {
      await this.content.scrollToTop();
    }
  }

  scrollPage(itemsToScroll: number, direction: 'forward' | 'backward') {
    return this.content.scrollByPoint(0,
      direction === 'forward' ? this.itemHeight * itemsToScroll : this.itemHeight * -itemsToScroll,
      2000
    );
  }
}
