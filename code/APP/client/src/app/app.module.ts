import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTooltipModule} from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { SearchResultsComponent } from './search-results/search-results.component';
import { FormatNamePipe } from './format-name.pipe';
import { FormatFreePipe } from "./format-free.pipe";
import { FeedbackColorPipe } from "./feedback-color.pipe";
import { WishlistComponent } from './wishlist/wishlist.component';
import { DetailPageComponent } from './detail-page/detail-page.component';
import {RoundProgressModule} from 'angular-svg-round-progressbar';


@NgModule({
  declarations: [
    AppComponent,
    SearchResultsComponent,
    FormatNamePipe,
    FormatFreePipe,
    FeedbackColorPipe,
    WishlistComponent,
    DetailPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatTooltipModule,
    FormsModule,
    RoundProgressModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
