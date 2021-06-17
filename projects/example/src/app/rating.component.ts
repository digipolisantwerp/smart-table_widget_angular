import {Component, OnInit} from '@angular/core';
import {Cell} from '@acpaas-ui/ngx-table';

@Component({
  template: `
    <div role="img" attr.aria-label="{{ starRating() }} van 5">
      <span [ngClass]="{'u-text-light ai--thin': starRating() < 1}"><aui-icon name="ai-rating-star"></aui-icon></span>
      <span [ngClass]="{'u-text-light ai--thin': starRating() < 2}"><aui-icon name="ai-rating-star"></aui-icon></span>
      <span [ngClass]="{'u-text-light ai--thin': starRating() < 3}"><aui-icon name="ai-rating-star"></aui-icon></span>
      <span [ngClass]="{'u-text-light ai--thin': starRating() < 4}"><aui-icon name="ai-rating-star"></aui-icon></span>
      <span [ngClass]="{'u-text-light ai--thin': starRating() < 5}"><aui-icon name="ai-rating-star"></aui-icon></span>
    </div>
  `,
})
export class AppRatingComponent implements OnInit, Cell {
  // score from 0 to 10
  public data: any;
  public metadata: any;

  ngOnInit() {
    // This is only for showing off the use of metadata
    console.log('Using rating type:', this.metadata.ratingType);
  }

  public starRating(): number {
    if (this.data >= 9) {
      return 5;
    } else {
      return Math.floor(this.data / 2);
    }
  }
}
