import {Component} from '@angular/core';
import {Cell} from '@acpaas-ui/ngx-table';

@Component({
  template: `
    <div role="img" attr.aria-label="{{ starRating() }} van 5">
      <span class="fa {{ (starRating() >= 1) ? 'fa-star' : 'fa-star-o' }}"></span>
      <span class="fa {{ (starRating() >= 2) ? 'fa-star' : 'fa-star-o' }}"></span>
      <span class="fa {{ (starRating() >= 3) ? 'fa-star' : 'fa-star-o' }}"></span>
      <span class="fa {{ (starRating() >= 4) ? 'fa-star' : 'fa-star-o' }}"></span>
      <span class="fa {{ (starRating() == 5) ? 'fa-star' : 'fa-star-o' }}"></span>
    </div>
  `,
})
export class AppRatingComponent implements Cell {
  // score from 0 to 10
  public data: any;

  public starRating(): number {
    if (this.data >= 9) {
      return 5;
    } else {
      return Math.floor(this.data / 2);
    }
  }
}
