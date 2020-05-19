import { Component, OnInit } from '@angular/core';
import { GithubService } from 'src/app/shared/services/github.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  constructor(
    private githubSvc: GithubService
  ) { }

  ngOnInit() {
  }

  search(query: string) {
    console.log('query: ', query);
  }

}
