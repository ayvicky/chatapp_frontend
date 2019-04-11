

import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { TokenService } from './token.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService) { }

  // tslint:disable-next-line:no-bitwise
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //    return next.handle(req);
    const headersConfig = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    const token = this.tokenService.getToken();
    if (token) {
      headersConfig['Authorization'] = `bearer ${token}`;
    }

    const _req = req.clone({ setHeaders: headersConfig });
    return next.handle(_req);
  }
}
