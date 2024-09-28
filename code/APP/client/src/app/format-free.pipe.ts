import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({name: 'formatFree'})
export class FormatFreePipe implements PipeTransform {
  transform(oldPrice: string): string {
    let price:number = parseFloat(oldPrice)
    if(price == 0) return "Free Shipping"
    else return "$"+oldPrice
  }
}