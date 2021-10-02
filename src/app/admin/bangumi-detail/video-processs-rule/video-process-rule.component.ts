import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { VideoProcessRule } from '../../../entity/VideoProcessRule';
import { UIDialog } from 'deneb-ui';
import { VideoProcessRuleEditorComponent } from './video-process-rule-editor/video-process-rule-editor.component';
import { filter } from 'rxjs/operators';
import { VideoProcessRuleService } from './video-process-rule.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'video-process-rule',
    templateUrl: './video-process-rule.html',
    styleUrls: ['./video-process-rule.less']
})
export class VideoProcessRuleComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    @Input()
    bangumiId: string;

    videoProcessRuleList: VideoProcessRule[];

    constructor(private _uiDialog: UIDialog, private _videoProcessRuleService: VideoProcessRuleService) {
    }

    onAddRule(): void {
        const editRuleDialogRef = this._uiDialog.open(VideoProcessRuleEditorComponent, {
            stickyDialog: false, backdrop: true
        });
        editRuleDialogRef.componentInstance.bangumiId = this.bangumiId;
        editRuleDialogRef.afterClosed()
            .pipe(filter(result => !!result))
            .subscribe(() => {
                this.refreshList();
            });
    }

    refreshList(): void {
        this._subscription.add(
            this._videoProcessRuleService
                .listRulesByBangumi(this.bangumiId)
                .subscribe((list) => {
                    this.videoProcessRuleList = list;
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    ngOnInit(): void {
        this.refreshList();
    }
}
