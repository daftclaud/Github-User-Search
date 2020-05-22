import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {

  @Input() numItems: number;
  @Input() itemsPerPage: number;
  @Input() stepSize: number;
  currentPage: number;
  lastPage: number;
  bucketIndex: number;
  lastBucketIndex: number;

  constructor() { }

  ngOnInit() {
    this.currentPage = 1;
    this.bucketIndex = 0;
    this.lastPage = Math.ceil(this.numItems / this.itemsPerPage);
    this.lastBucketIndex = Math.ceil(this.lastPage / this.stepSize) - 1;
  }

  previous() {
    console.log('To-do: implement previous');
  }

  next() {
    console.log('To-do: implement next');
  }

  goToPage() {
    console.log('To-do: implement goToPage');
  }

}
