
import {tap, filter} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { BangumiAuthDialogComponent } from './bangumi-auth-dialog/bangumi-auth-dialog.component';
import { Bangumi } from '../entity';
import { RPCResult } from './extension-rpc';
import { ExtensionRpcService } from './extension-rpc.service';

export interface IAuthInfo {
    id: string; // user's uid
    url: string; // user url
    username: string; // user's uid, wtf
    nickname: string;
    avatar: {
        large: string, // large image url
        medium: string, // medium image url
        small: string // small image url
    },
    sign: string,
    auth: string, // issued by auth server, used in ${AUTH_TOKEN}
    auth_encode?: string // ${AUTH_TOKEN) encoded by urlencode()
}

export type INITIAL_STATE = 0;
export type AuthInfo = IAuthInfo | null | INITIAL_STATE;

export const INITIAL_STATE_VALUE = 0;

export enum LOGON_STATUS {
    UNSURE, TRUE, FALSE
}

export enum ENABLED_STATUS {
    UNSURE, TRUE, FALSE
}


@Injectable()
export class ChromeExtensionService {

    private _authInfo = new BehaviorSubject<AuthInfo>(INITIAL_STATE_VALUE);
    private _isBgmTvLogon = new BehaviorSubject<LOGON_STATUS>(LOGON_STATUS.UNSURE);
    private _isEnabled = new BehaviorSubject<ENABLED_STATUS>(ENABLED_STATUS.UNSURE);

    get isEnabled(): Observable<ENABLED_STATUS> {
        return this._isEnabled;
    }

    get authInfo(): Observable<AuthInfo> {
        return this._authInfo.asObservable();
    }

    get isBgmTvLogon(): Observable<LOGON_STATUS> {
        return this._isBgmTvLogon.asObservable();
    }

    constructor(private _extensionRpcService: ExtensionRpcService) {
        if (this._extensionRpcService.isExtensionEnabled()) {
            this.isEnabled.pipe(filter(isEnabled => isEnabled === ENABLED_STATUS.TRUE))
                .subscribe(() => {
                    this.invokeBangumiMethod('getAuthInfo', [])
                        .subscribe(authInfo => {
                            // console.log(authInfo);
                            this._authInfo.next(authInfo);
                        });
                    this.invokeBangumiWebMethod('checkLoginStatus', [])
                        .subscribe(result => {
                            // console.log(result);
                            if (result.isLogin) {
                                this._isBgmTvLogon.next(LOGON_STATUS.TRUE);
                            } else {
                                this._isBgmTvLogon.next(LOGON_STATUS.FALSE);
                            }
                        });
                });
            this._extensionRpcService.invokeRPC('BackgroundCore', 'verify', [], 500)
                .subscribe((resp) => {
                    // console.log(resp);
                    if (resp === 'OK') {
                        this._isEnabled.next(ENABLED_STATUS.TRUE);
                    } else {
                        this._isEnabled.next(ENABLED_STATUS.FALSE);
                    }
                }, (err) => {
                    console.log(err);
                    this._isEnabled.next(ENABLED_STATUS.FALSE);
                });
        } else {
            this._isEnabled.next(ENABLED_STATUS.FALSE);
        }
    }

    invokeBangumiMethod(method: string, args: any[]): Observable<any> {
        return this._extensionRpcService.invokeRPC('BangumiAPIProxy', method, args);
    }

    invokeBangumiWebMethod(method: string, args: any[]): Observable<any> {
        return this._extensionRpcService.invokeRPC('BangumiWebProxy', method, args);
    }

    auth(username: string, password: string): Observable<any> {
        return this.invokeBangumiMethod('auth', [username, password]).pipe(
            tap(data => {
                this._authInfo.next(data);
            }));
    }

    openBgmForResult(): Observable<any> {
        return this._extensionRpcService.invokeRPC('BackgroundCore', 'openBgmForResult', []).pipe(
            tap(() => {
                this._isBgmTvLogon.next(LOGON_STATUS.TRUE);
            }));
    }

    revokeAuth(): Observable<any> {
        return this.invokeBangumiMethod('revokeAuth', []).pipe(
            tap(() => {
                this._authInfo.next(null);
            }));
    }

    syncBangumi(bangumi: Bangumi): Observable<any> {
        return this._extensionRpcService.invokeRPC('Synchronize', 'syncOne', [bangumi]);
    }

    solveConflict(bangumi: Bangumi, bgmFavStatus: number, choice: string): Observable<any> {
        return this._extensionRpcService.invokeRPC('Synchronize', 'solveConflict', [bangumi, bgmFavStatus, choice]);
    }

    updateFavoriteAndSync(bangumi: Bangumi, favStatus: any): Observable<any> {
        return this._extensionRpcService.invokeRPC('Synchronize', 'updateFavorite', [bangumi, favStatus]);
    }

    deleteFavoriteAndSync(bangumi: Bangumi): Observable<any> {
        return this._extensionRpcService.invokeRPC('Synchronize', 'deleteFavorite', [bangumi]);
    }

    syncProgress(bangumi: Bangumi): Observable<any> {
        return this._extensionRpcService.invokeRPC('Synchronize', 'syncProgress', [bangumi]);
    }
}
