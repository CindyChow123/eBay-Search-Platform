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
@Pipe({name: 'feedbackColor'})
export class FeedbackColorPipe implements PipeTransform {
  transform(oldstr: string): string {
    let findS = oldstr.indexOf("Shooting")
    if (findS == -1) return oldstr
    else return oldstr.substring(0,findS)
  }
}