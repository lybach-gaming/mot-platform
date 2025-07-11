import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class AppLogger extends Logger {
  logDev(message: any, ...optionalParams: [...any, string?]) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    this.log(message, ...optionalParams);
  }
}
