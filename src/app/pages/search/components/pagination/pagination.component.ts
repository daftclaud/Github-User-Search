import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  // To-do: Add input for scroll events subject
  @Output() navigate: EventEmitter<PaginationOutput> = new EventEmitter();
  pagesNavigated: number[];
  currentPage: number;
  lastPage: number;
  bucketIndex: number;
  lastBucketIndex: number;

  constructor() {}

  ngOnInit() {
    this.currentPage = 1;
    this.bucketIndex = 0;
    this.pagesNavigated = [1];
    this.lastPage = this.itemTotal < this.maxItems ?
    Math.ceil(this.itemTotal / this.itemsPerPage) :
    Math.ceil(this.maxItems / this.itemsPerPage);
    this.lastBucketIndex = Math.ceil(this.lastPage / this.stepSize) - 1;
  }

  changePage(page: number) {
    this.currentPage = page;
    if (!this.pagesNavigated.includes(this.currentPage)) {
      this.pagesNavigated.push(this.currentPage);
    }
    for (let i = 0; i <= this.lastBucketIndex; i++) {
      const pagesInBucket = [i * this.stepSize + 1, i * this.stepSize + 2, i * this.stepSize + 3];
      if (pagesInBucket.includes(this.currentPage)) {
        this.bucketIndex = i;
        break;
      }
    }
  }

  previousPage() {
    if (this.shouldFetch(this.currentPage - 1)) {
      this.navigate.emit({
        currentPage: this.currentPage - 1,
        requestParams: [this.currentPage - 1, this.itemsPerPage, true],
      });
    } else {
      this.navigate.emit({
        currentPage: this.currentPage - 1,
      });
    }
    this.changePage(this.currentPage - 1);
  }

  nextPage() {
    if (this.shouldFetch(this.currentPage + 1)) {
      this.navigate.emit({
        currentPage: this.currentPage + 1,
        requestParams: [this.currentPage + 1, this.itemsPerPage, false],
      });
    } else {
      this.navigate.emit({
        currentPage: this.currentPage + 1,
      });
    }
    this.changePage(this.currentPage + 1);
  }

  goToPage(page: number) {
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
        requestParams: [page, this.itemsPerPage * diff, false], // check it should be true or false
      };
    } else {
      opts = {
        currentPage: page,
      };
    }

    this.navigate.emit(opts);
    this.changePage(page);
  }

  private shouldFetch(page: number) {
    return !this.pagesNavigated.includes(page);
  }
}
