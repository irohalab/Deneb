import { Bangumi } from '../../entity';
import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BANGUMI_TYPE, FAVORITE_LABEL } from '../../entity/constants';
import { WatchService } from '../watch.service';
import { HomeService } from '../home.service';
import { EditReviewDialogComponent } from '../rating/edit-review-dialog/edit-review-dialog.component';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Subscription } from 'rxjs/Subscription';
import { AuthInfo, ChromeExtensionService, LOGON_STATUS } from '../../browser-extension/chrome-extension.service';
import { SynchronizeService } from './synchronize.service';

@Component({
    selector: 'favorite-chooser',
    templateUrl: './favorite-chooser.html',
    styleUrls: ['./favorite-chooser.less'],
    encapsulation: ViewEncapsulation.None
})
export class FavoriteChooser implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;
    FAVORITE_LABEL = FAVORITE_LABEL;
    BANGUMI_TYPE = BANGUMI_TYPE;

    isChoosingFavorite = false;
    isSavingFavorite = false;

    toggleButtonText = '收藏';

    @Input()
    bangumi: Bangumi;

    isExtensionEnabled: boolean;
    authInfo: AuthInfo;
    isBgmLogin = LOGON_STATUS.UNSURE;

    @Input()
    loadBgmInfo: boolean;

    userFavoriteInfo: any;

    isOnSynchronizing: boolean;

    constructor(private watchService: WatchService,
                private homeService: HomeService,
                private _dialog: UIDialog,
                private _chromeExtensionService: ChromeExtensionService,
                private _synchronize: SynchronizeService,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    onEditReview() {
        const dialogRef = this._dialog.open(EditReviewDialogComponent, {backdrop: true, stickyDialog: true});
        if (this.userFavoriteInfo) {
            dialogRef.componentInstance.comment = this.userFavoriteInfo.comment;
            dialogRef.componentInstance.rating = this.userFavoriteInfo.rating;
            dialogRef.componentInstance.tags = Array.isArray(this.userFavoriteInfo.tags) ? this.userFavoriteInfo.tags.join(' ') : '';
        }
        dialogRef.componentInstance.bangumi = this.bangumi;
        this._subscription.add(dialogRef.afterClosed()
            .filter(result => !!result)
            .subscribe((result) => {
                if (!this.userFavoriteInfo) {
                    this.userFavoriteInfo = {};
                }
                this.userFavoriteInfo.rating = result.rating;
                this.userFavoriteInfo.comment = result.comment;
                this.bangumi.favorite_status = result.interest;
            }));
    }

    deleteFavorite() {
        if (this.isExtensionEnabled) {
            this._subscription.add(
                this._synchronize.deleteFavorite(this.bangumi)
                    .subscribe(() => {
                        this.homeService.changeFavorite();
                        this.bangumi.favorite_status = undefined;
                        this._toastRef.show('已删除收藏');
                    })
            );
        } else {
            this._subscription.add(
                this.watchService.delete_favorite(this.bangumi.id)
                    .subscribe(() => {
                        this.homeService.changeFavorite();
                        this.bangumi.favorite_status = undefined;
                        this._toastRef.show('已删除收藏');
                    })
            );
        }
    }

    toggleFavoriteChooser() {
        if (this.isExtensionEnabled && this.loadBgmInfo) {
            this.onEditReview();
        } else {
            this.isChoosingFavorite = !this.isChoosingFavorite;
        }
    }

    chooseFavoriteStatus(status) {
        this.isChoosingFavorite = false;
        this.isSavingFavorite = true;
        this.watchService.favorite_bangumi(this.bangumi.id, status)
            .subscribe(() => {
                this.bangumi.favorite_status = status;
                this.homeService.changeFavorite();
                console.log('update favorite successful');
            }, () => {
                console.log('update favorite error');
            }, () => {
                this.isSavingFavorite = false;
            });
    }

    ngOnInit(): void {
        this.isOnSynchronizing = true;
        this._subscription.add(
            this._chromeExtensionService.isEnabled
                .do(isEnabled => {
                    this.isExtensionEnabled = isEnabled;
                })
                .filter(isEnabled => isEnabled)
                .flatMap(() => {
                    return this._chromeExtensionService.authInfo;
                })
                .do(authInfo => {
                    this.authInfo = authInfo;
                })
                .filter(authInfo => !!authInfo)
                .flatMap(() => {
                    return this._chromeExtensionService.isBgmTvLogon;
                })
                .do(isLogin => {
                    this.isBgmLogin = isLogin;
                    if (this.isBgmLogin === LOGON_STATUS.TRUE && !!this.authInfo) {
                        this.toggleButtonText = '收藏/评价';
                    } else {
                        this.toggleButtonText = '收藏 (未关联Bangumi无法同步)';
                    }
                })
                .filter(isLogin => isLogin === LOGON_STATUS.TRUE)
                .flatMap(() => {
                    return this._synchronize.syncBangumi(this.bangumi);
                })
                .subscribe(result => {
                    this.isOnSynchronizing = false;
                    this.userFavoriteInfo = result.data;
                    if (result.data && result.data.status && result.data.status.id) {
                        this.bangumi.favorite_status = result.data.status.id;
                    }
                    console.log(result);
                }, (error) => {
                    console.log(error);
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
