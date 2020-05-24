import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
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
export class PaginationComponent implements OnInit {
  @Input() numItems: number;
  @Input() itemTotal: number;
  @Input() itemsPerPage: number;
  @Input() stepSize: number;
  @Input() maxItems: number;
  @Input() completeNavigation$: Observable<void>;
  // To-do: Add input for scroll events subject
  @Output() navigate: EventEmitter<PaginationOutput> = new EventEmitter();
  targetPage: number;
  pagesNavigated: number[];
  currentPage: number;
  lastPage: number;
  bucketIndex: number;
  lastBucketIndex: number;

  constructor() {}

  ngOnInit() {
    this.currentPage = 1;
    this.targetPage = 1;
    this.bucketIndex = 0;
    this.pagesNavigated = [1];
    this.lastPage =
      this.itemTotal < this.maxItems
        ? Math.ceil(this.itemTotal / this.itemsPerPage)
        : Math.ceil(this.maxItems / this.itemsPerPage);
    this.lastBucketIndex = Math.ceil(this.lastPage / this.stepSize) - 1;

    this.completeNavigation$.subscribe(_ => {
      this.changePage();
    });
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
