import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'compactNumber'
})
export class CompactNumberPipe implements PipeTransform {
  transform(value: number, digits: number = 1): string {
    if (value == null) return '';
    if (value < 1000) return value.toString();

    const units = ['K', 'M', 'B', 'T'];
    let unit = -1;
    let num = value;
    while (num >= 1000 && unit < units.length - 1) {
      num /= 1000;
      unit++;
    }
    return num.toFixed(digits) + units[unit];
  }
}
