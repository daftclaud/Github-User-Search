import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
export interface PaginationOutput {
  currentPage: number;
  requestParams?: [number, number, boolean];
  refresh?: boolean;
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit, OnDestroy {
  @Input() numItems: number;
  @Input() itemTotal: number;
  @Input() itemsPerPage: number;
  @Input() stepSize: number;
  @Input() maxItems: number;
  @Input() completeNavigation$: Observable<void>;
  completeSub: Subscription;
  @Input() reset$: Observable<void>;
  resetSub: Subscription;
  @Output() navigate: EventEmitter<PaginationOutput> = new EventEmitter();

  targetPage: number; // Keeps track of page to navigate if items are succesfully loaded
  pagesNavigated: number[]; // History of the pages that have been loaded
  currentPage: number;
  lastPage: number;
  bucketIndex: number; // Keeps track of which page group to display ("1 2 3", "4 5 6", etc...)
  lastBucketIndex: number;

  constructor() {}

  ngOnInit() {
    this.initValues();

    this.completeSub = this.completeNavigation$.subscribe(_ => this.changePage());
    this.resetSub = this.reset$.subscribe(_ => this.initValues());
  }

  initValues() {
    this.currentPage = 1;
    this.targetPage = 1;
    this.bucketIndex = 0;
    this.pagesNavigated = [1];
    this.lastPage =
      this.itemTotal < this.maxItems
        ? Math.ceil(this.itemTotal / this.itemsPerPage)
        : Math.ceil(this.maxItems / this.itemsPerPage);
    this.lastBucketIndex = Math.ceil(this.lastPage / this.stepSize) - 1;
  }

  ngOnDestroy() {
    this.completeSub.unsubscribe();
    this.resetSub.unsubscribe();
  }

  changePage() {
    this.currentPage = this.targetPage;
    this.targetPage = null;
    if (!this.pagesNavigated.includes(this.currentPage)) {
      this.pagesNavigated.push(this.currentPage);
    }
    if (this.bucketIndex === this.lastBucketIndex) {
      if (this.currentPage < this.lastPage - 2) {
        this.updateBucketIndex();
      }
    } else {
      this.updateBucketIndex();
    }
  }

  updateBucketIndex() {
    for (let i = 0; i <= this.lastBucketIndex; i++) {
      const pagesInBucket = [
        i * this.stepSize + 1,
        i * this.stepSize + 2,
        i * this.stepSize + 3,
      ];
      if (pagesInBucket.includes(this.currentPage)) {
        this.bucketIndex = i;
        break;
      }
    }
  }

  previousPage() {
    this.targetPage = this.currentPage - 1;
    if (this.shouldFetch(this.currentPage - 1)) {
      this.navigate.emit({
        currentPage: this.currentPage - 1,
        requestParams: [this.currentPage - 1, this.itemsPerPage, true],
      });
    } else {
      this.navigate.emit({
        currentPage: this.currentPage - 1,
      });
      this.changePage();
    }
  }

  nextPage() {
    this.targetPage = this.currentPage + 1;
    if (this.shouldFetch(this.currentPage + 1)) {
      this.navigate.emit({
        currentPage: this.currentPage + 1,
        requestParams: [this.currentPage + 1, this.itemsPerPage, false],
      });
    } else {
      this.navigate.emit({
        currentPage: this.currentPage + 1,
      });
      this.changePage();
    }
  }

  goToPage(page: number) {
    this.targetPage = page;
    const diff = Math.abs(this.currentPage - page);
    let opts: PaginationOutput;

    if (diff > 2) {
      opts = {
        currentPage: page,
        refresh: true,
        requestParams: [page, this.itemsPerPage, false],
      };
    } else if (this.shouldFetch(page)) {
      opts = {
        currentPage: page,
        requestParams: [
          page,
          this.itemsPerPage * diff,
          this.currentPage > page,
        ],
      };
    } else {
      opts = {
        currentPage: page,
      };
      this.changePage();
    }

    this.navigate.emit(opts);
  }

  private shouldFetch(page: number) {
    return !this.pagesNavigated.includes(page);
  }
}
