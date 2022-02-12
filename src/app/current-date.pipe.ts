import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currentDate'
})
export class CurrentDatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
