import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { IMAGE_PROPERTY_NAME } from '../../../core/video-capture.service';
import { UIDialogRef } from 'deneb-ui';
import { PersistStorage } from '../../../../user-service/persist-storage';

export const RESULT_TWITTER = 'twitter';
export const RESULT_DOWNLOAD = 'download';
export const RESULT_TRASH = 'trash';

export const SETTING_AUTO_REMOTE = 'VideoPlayer:CaptureList:AutoRemove';

@Component({
    selector: 'captured-image-operation-dialog',
    templateUrl: './operation-dialog.html',
    styleUrls: ['./operation-dialog.less']
})
export class CapturedImageOperationDialog implements AfterViewInit {
    image: HTMLImageElement;
    autoRemove: boolean;

    @ViewChild('imageWrapper') imageWrapper: ElementRef;

    constructor(private _dialogRef: UIDialogRef<CapturedImageOperationDialog>,
                private _persistStorage: PersistStorage) {
        let savedAutoRemove = this._persistStorage.getItem(SETTING_AUTO_REMOTE, 'true');
        this.autoRemove = savedAutoRemove === 'true';
    }

    shareToTwitter(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._dialogRef.close({result: RESULT_TWITTER, remove: this.autoRemove});
    }

    download(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        let dataURI = this.image.src;
        let {bangumi_name, episode_no, currentPlayTime} = this.image[IMAGE_PROPERTY_NAME];
        let hiddenAnchor = document.createElement('a');
        let filename = `${bangumi_name}_${episode_no}_${Math.round(currentPlayTime)}.png`;
        hiddenAnchor.setAttribute('download', filename);
        hiddenAnchor.setAttribute('href', dataURI.replace(/^data:image\/[^;]]/, 'data:application/octet-stream'));
        let clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: false
        });
        hiddenAnchor.dispatchEvent(clickEvent);
        this._dialogRef.close({result: RESULT_DOWNLOAD, remove: this.autoRemove});
    }

    trash(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._dialogRef.close({result: RESULT_DOWNLOAD, remove: true});
    }

    toggleDefaultOperation(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.autoRemove = !this.autoRemove;
        this._persistStorage.setItem(SETTING_AUTO_REMOTE, this.autoRemove + '');
    }

    ngAfterViewInit(): void {
        let imageWrapperElement = this.imageWrapper.nativeElement as HTMLElement;
        imageWrapperElement.appendChild(this.image);
    }
}
