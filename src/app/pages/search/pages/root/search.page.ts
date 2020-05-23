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
export class SearchPage {
  query: string;
  remainingRequests: number;
  resultCount: number;
  results: GitUser[];

  usersPerPage = 30;
  itemHeight = 44;

  @ViewChild(IonContent) content: IonContent;

  constructor(private githubSvc: GithubService) {}

  onNavigate(args: PaginationOutput) {
    // Nice-to-have: conditional types for PaginationOutput
    // if args.refresh is present then requestParams is required
    if (args.refresh) {
      this.results = [];
      this.getItems(...args.requestParams);
      return;
    }

    if (args.requestParams) {
      this.getItems(...args.requestParams);
    }

    this.scrollToPage(args.currentPage);
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

  scrollToPage(page: number) {
    return this.content.scrollToPoint(0,
      this.itemHeight * ((page - 1) * this.usersPerPage),
      2000
    );
  }
}
