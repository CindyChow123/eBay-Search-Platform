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
@Pipe({name: 'formatName'})
export class FormatNamePipe implements PipeTransform {
  transform(oldName: string): string {
    let result:string = oldName;
    if (oldName.length > 35){
        result = result.substring(0,35)
        if (oldName[35] != ' '){
            let idx = result.lastIndexOf(' ')
            result = result.substring(0,idx+1)
        }
    }
    return result+"..."
  }
}