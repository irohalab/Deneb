import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Bangumi } from '../../entity/bangumi';
import { Subscription } from 'rxjs/Subscription';
import { HomeService } from '../home.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FAVORITE_LABEL } from '../../entity/constants';
import { closest } from '../../../helpers/dom';

@Component({
    selector: 'my-bangumi',
    templateUrl: './my-bangumi.html',
    styleUrls: ['./my-bangumi.less']
})
export class MyBangumiComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _statusSubject = new BehaviorSubject<number>(Bangumi.WATCHING);

    myBangumiList: Bangumi[];

    favoriteLabel = FAVORITE_LABEL;

    get currentStatus(): number {
        return this._statusSubject.getValue();
    }

    constructor(private _homeService: HomeService) {
    }

    @HostListener('click', ['$event'])
    onHostClick(event: Event) {
        let parent = closest(event.target, '.favorite-item');
        if (!parent) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    changeStatus(status: number) {
        this._statusSubject.next(status);
    }

    ngOnInit(): void {
        this._subscription.add(
            this._homeService.watchProgressChanges.subscribe((bangumi_id) => {
                if (Array.isArray(this.myBangumiList)) {
                    let bangumi = this.myBangumiList.find(bangumi => bangumi.id === bangumi_id);
                    if (bangumi && bangumi.unwatched_count > 0) {
                        bangumi.unwatched_count--;
                    }
                }
            })
        );

        this._subscription.add(
            this._statusSubject
                .merge(this._homeService.favoriteChanges)
                .flatMap(() => {
                    return this._homeService.myBangumi(this.currentStatus)
                })
                .subscribe((bangumiList) => {
                    this.myBangumiList = bangumiList;
                })
        );

        this._subscription.add(
            this._homeService.favoriteChecked
                .subscribe((result) => {
                    let bangumi = this.myBangumiList.find(bangumi => bangumi.id === result.bangumi_id);
                    console.log(bangumi);
                    if (bangumi) {
                        bangumi.favorite_check_time = result.check_time;
                    }
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
