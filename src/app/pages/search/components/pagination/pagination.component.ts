import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
export interface PaginationOutput {
  navEvent: 'next' | 'prev' | 'refresh';
  requestParams?: [number, number, boolean];
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
    this.lastPage = Math.ceil(this.itemTotal / this.itemsPerPage);
    this.lastBucketIndex = Math.ceil(this.lastPage / this.stepSize) - 1;
  }

  previousPage() {
    this.currentPage--;
    if (this.shouldFetch(this.currentPage)) {
      console.log('fetching more items');
      this.navigate.emit({
        navEvent: 'prev',
        requestParams: [this.currentPage, this.itemsPerPage, true],
      });
    } else {
      this.navigate.emit({
        navEvent: 'prev',
      });
    }
    if (!this.pagesNavigated.includes(this.currentPage)) {
      this.pagesNavigated.push(this.currentPage);
    }
  }

  nextPage() {
    this.currentPage++;
    if (this.shouldFetch(this.currentPage)) {
      console.log('fetching more items');
      this.navigate.emit({
        navEvent: 'next',
        requestParams: [this.currentPage, this.itemsPerPage, false],
      });
    } else {
      this.navigate.emit({
        navEvent: 'next',
      });
    }
    if (!this.pagesNavigated.includes(this.currentPage)) {
      this.pagesNavigated.push(this.currentPage);
    }
  }

  goToPage() {
    console.log('To-do: implement goToPage');
  }

  private shouldFetch(page: number) {
    return !this.pagesNavigated.includes(page);
  }
}
