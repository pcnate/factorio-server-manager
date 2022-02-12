import { Pipe, PipeTransform } from '@angular/core';
import * as fileSize from 'filesize';

@Pipe({
  name: 'filesize'
})
export class FilesizePipe implements PipeTransform {

  transform( value: number, ...args: unknown[] ): string {
    return fileSize( value, { base: 10 } );
  }

}
