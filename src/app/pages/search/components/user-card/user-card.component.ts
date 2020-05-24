import { Component, OnInit, Input } from '@angular/core';
import { GitUser } from 'src/app/shared/services/github.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
})
export class UserCardComponent implements OnInit {

  @Input() user: GitUser;

  constructor() { }

  ngOnInit() {}

}
