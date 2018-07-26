import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeType = (control: AbstractControl ): Promise<{[key: string]: any}> | Observable<{[key: string]: any}> => {
  if (typeof(control.value) === 'string') {
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  return Observable.create(
    ( observer: Observer<{[key: string]: any}> ) => {
      fileReader.addEventListener('loadend', () => {
        const arr = new Uint8Array( fileReader.result).subarray(0, 4);
        const header = arr.reduce( ( pV, cV) => pV + cV.toString(16), '');
        let isValid = false;
        switch (header) {
          case '89504e47':
            isValid = true;
            break;
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            isValid = true;
            break;
          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
        }
        if (isValid) {
          observer.next(null);
        } else {
          observer.next({ invalidMimeType: true });
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file);
  });
};
