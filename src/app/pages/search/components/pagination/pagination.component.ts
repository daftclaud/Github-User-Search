import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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
  //                               page, itemsToGet, addToFront
  @Output() getMore: EventEmitter<[number, number,  boolean]> = new EventEmitter();
  pagesNavigated: number[];
  currentPage: number;
  lastPage: number;
  bucketIndex: number;
  lastBucketIndex: number;

  constructor() { }

  ngOnInit() {
    this.currentPage = 1;
    this.bucketIndex = 0;
    this.pagesNavigated = [0];
    this.lastPage = Math.ceil(this.itemTotal / this.itemsPerPage);
    this.lastBucketIndex = Math.ceil(this.lastPage / this.stepSize) - 1;
  }

  previousPage() {
    this.currentPage--;
    if (!this.pagesNavigated.includes(this.currentPage)) {
      this.pagesNavigated.push(this.currentPage);
    }
    if (this.shouldFetch(this.currentPage)) {
      this.getMore.emit([this.currentPage, this.itemsPerPage, true]);
    }
  }

  nextPage() {
    this.currentPage++;
    if (!this.pagesNavigated.includes(this.currentPage)) {
      this.pagesNavigated.push(this.currentPage);
    }
    if (this.shouldFetch(this.currentPage)) {
      this.getMore.emit([this.currentPage, this.itemsPerPage, false]);
    }
  }

  goToPage() {
    console.log('To-do: implement goToPage');
  }

  private shouldFetch(page: number) {
    return this.pagesNavigated.includes(page);
  }

}
