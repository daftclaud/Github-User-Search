import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPageRoutingModule } from './search-routing.module';

import { SearchPage } from './pages/root/search.page';
import { PaginationComponent } from './components/pagination/pagination.component';
import { UserCardComponent } from './components/user-card/user-card.component';
import { LoadingComponent } from './components/loading/loading.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchPageRoutingModule
  ],
  declarations: [SearchPage, PaginationComponent, UserCardComponent, LoadingComponent]
})
export class SearchPageModule {}
