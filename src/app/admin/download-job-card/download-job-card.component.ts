import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DownloadJob } from '../../entity/DownloadJob';
import { JobStatus } from '../../entity/JobStatus';
import { UIDialog } from 'deneb-ui';
import { FileMappingListComponent } from './file-mapping-list/file-mapping-list.component';

@Component({
    selector: 'download-job-card',
    templateUrl: './download-job-card.html',
    styleUrls: ['./download-job-card.less'],
    encapsulation: ViewEncapsulation.None
})
export class DownloadJobCardComponent {
    @Input()
    job: DownloadJob;

    mJobStatus: {[key: string]: JobStatus} = {
        Pending: JobStatus.Pending,
        Downloading:JobStatus.Downloading,
        Complete: JobStatus.Complete,
        Error: JobStatus.Error,
        Removed: JobStatus.Removed,
        Paused: JobStatus.Paused
    };

    constructor(private _dialog: UIDialog) {
    }

    public onViewFileMapping() {
        const dialogRef = this._dialog.open(FileMappingListComponent, {stickyDialog: false, backdrop: true})
        dialogRef.componentInstance.fileMapping = this.job.fileMapping;
        dialogRef.componentInstance.jobId = this.job.id;
    }
}
