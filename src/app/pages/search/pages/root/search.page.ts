import { Component, OnInit, ViewChild } from '@angular/core';
import { GithubService, GitUser } from 'src/app/shared/services/github.service';
import { take } from 'rxjs/operators';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';
import { PaginationOutput } from '../../components/pagination/pagination.component';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {
  query: string;
  loading = false;
  remainingRequests: number;
  resultCount: number;
  results: GitUser[];

  usersPerPage = 30;
  itemHeight = 175 + 48;

  @ViewChild(IonContent) content: IonContent;

  constructor(
    private githubSvc: GithubService,
    private toastSvc: ToastService
  ) {}

  async onNavigate(args: PaginationOutput) {
    if (args.refresh) {
      this.results = [];
    }

    if (args.requestParams) {
      this.loading = true;
      await this.getItems(...args.requestParams);
      this.loading = false;
    }

    this.scrollToPage(args.currentPage);
  }

  private isEmpty(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  async getItems(page: number, itemsToGet: number, prepend: boolean) {
    this.loading = true;

    try {
      const res = await this.githubSvc.searchUsers(
        this.query,
        page,
        itemsToGet || this.usersPerPage
      );
      if (this.isEmpty(res)) {
        this.toastSvc.makeToast(
          'There was a problem while getting the results. Please wait a minute and try again'
        );
        return;
      }
      const users = res.users as GitUser[];
      this.remainingRequests = res.remaining;
      if (prepend) {
        this.results.unshift(...users);
        this.results = [...new Set(this.results)]; // removes duplicates
      } else {
        this.results = this.results ? this.results.concat(users) : users;
      }

      console.log(this.results.length);

      return res;
    } catch (error) {
      this.toastSvc.makeToast(error.message);
    }

    /**
     * This takes care of a 'bug' where the github api returns less items than it was asked for.
     * It usually happens when there aren't many results (~300).
     */
    // if (itemsToGet && items.length < itemsToGet) {
    //   const pt1 = await this.githubSvc
    //     .searchUsers(this.query, page - 1, this.usersPerPage)
    //     .pipe(take(1))
    //     .toPromise();
    //   const pt2 = await this.githubSvc
    //     .searchUsers(this.query, page, this.usersPerPage)
    //     .pipe(take(1))
    //     .toPromise();
    //   items = (pt1.body as any).items.concat((pt2.body as any).items);
    // }
  }

  // To-do: debounce search button
  async search(query: string) {
    if (this.query && this.query === query) {
      return;
    }
    this.query = query;
    this.loading = true;
    try {
      const res = await this.getItems(1, this.usersPerPage, false);
      this.resultCount = res.resultCount;
      if (this.results) {
        await this.content.scrollToTop();
      }
    } catch (error) {
      this.toastSvc.makeToast(error.message);
    }
    this.loading = false;
  }

  scrollToPage(page: number) {
    return this.content.scrollToPoint(
      0,
      this.itemHeight * ((page - 1) * this.usersPerPage),
      2000
    );
  }
}
