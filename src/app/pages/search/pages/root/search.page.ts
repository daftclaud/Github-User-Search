import { Component, ViewChild } from '@angular/core';
import { GithubService, GitUser } from 'src/app/shared/services/github.service';
import { IonContent, LoadingController } from '@ionic/angular';
import { PaginationOutput } from '../../components/pagination/pagination.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { BehaviorSubject } from 'rxjs';

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

  onComplete$: BehaviorSubject<void> = new BehaviorSubject(null);

  usersPerPage = 30;
  itemHeight = 175 + 24; // height + margin

  @ViewChild(IonContent) content: IonContent;

  constructor(
    private githubSvc: GithubService,
    private toastSvc: ToastService,
    private loadingCtrl: LoadingController
  ) {}

  async onNavigate(args: PaginationOutput) {
    const copy = this.results;
    if (args.refresh) {
      this.results = [];
    }

    if (args.requestParams) {
      const loading = await this.loadingCtrl.create({
        message: 'Getting more users...',
      });
      await loading.present();
      this.loading = true;
      const res = await this.getItems(...args.requestParams);
      this.loading = false;
      loading.dismiss();
      if (!res) {
        this.results = copy;
        return;
      }
      this.onComplete$.next();
    }

    this.scrollToPage(args.currentPage);
  }

  private isEmpty(obj: object) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  async getItems(page: number, itemsToGet: number, prepend: boolean) {
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

      return res;
    } catch (error) {
      this.toastSvc.makeToast(error.message);
      return error;
    }
  }

  async search(query: string) {
    if ((this.query && this.query === query) || this.loading) {
      return;
    }
    this.query = query;
    this.loading = true;
    const res = await this.getItems(1, this.usersPerPage, false);
    this.loading = false;
    this.resultCount = res.resultCount;
    if (this.results) {
      await this.content.scrollToTop();
    }
  }

  scrollToPage(page: number) {
    return this.content.scrollToPoint(
      0,
      this.itemHeight * ((page - 1) * this.usersPerPage) + 16,
      2000
    );
  }
}
