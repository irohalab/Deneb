import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VideoProcessRuleService } from '../video-process-rule.service';
import { Action } from '../../../../entity/action';
import { ActionType } from '../../../../entity/action-type';
import { ProfileType } from '../../../../entity/ProfileType';
import { UIDialogRef, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Subscription } from 'rxjs';
import { VideoProcessRule } from '../../../../entity/VideoProcessRule';

@Component({
    selector: 'video-process-rule-editor',
    templateUrl: './video-process-rule-editor.html',
    styleUrls: ['./video-process-rule-editor.less']
})
export class VideoProcessRuleEditorComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    @Input()
    bangumiId: string;

    @Input()
    videoId: string = null;

    @Input()
    rule: VideoProcessRule;

    basicInfoForm: FormGroup;

    actions: Action[];

    eActionType = ActionType;

    eProfileType = ProfileType;

    constructor(private _fb: FormBuilder,
                private _videoProcessRuleService: VideoProcessRuleService,
                private _dialogRef: UIDialogRef<VideoProcessRuleEditorComponent>,
                toastService: UIToast) {
        this._toastRef = toastService.makeText();
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    ngOnInit(): void {
        if (this.rule) {
            this.basicInfoForm = this._fb.group({
                name: [this.rule.name],
                condition: [this.rule.condition]
            });
            this.actions = this.rule.actions;
            this.bangumiId = this.rule.bangumiId;
            this.videoId = this.rule.videoFileId;
        } else {
            this.basicInfoForm = this._fb.group({
                name: [''],
                condition: ['']
            });
        }
    }

    addAction(): void {
        if (!this.actions) {
            this.actions = [];
        }
        this.actions.push(new Action());
    }

    save(): void {
        const condition = this.basicInfoForm.value.condition;
        const name = this.basicInfoForm.value.name;
        if (this.rule) {
            this.rule.name = name;
            this.rule.condition = condition;
            this._subscription.add(
                this._videoProcessRuleService
                    .editRule(this.rule)
                    .subscribe((rule) => {
                        this._toastRef.show('Update Successful');
                        this._dialogRef.close(rule);
                    })
            );
        } else {
            this._subscription.add(
                this._videoProcessRuleService.addRule({
                    name: name,
                    bangumiId: this.bangumiId,
                    videoFileId: this.videoId,
                    condition: condition,
                    actions: this.actions,
                    priority: 0
                })
                    .subscribe((rule) => {
                        this._toastRef.show('Add Successful');
                        this._dialogRef.close(rule);
                    })
            );
        }
    }

    cancel(): void {
        this._dialogRef.close();
    }
}
