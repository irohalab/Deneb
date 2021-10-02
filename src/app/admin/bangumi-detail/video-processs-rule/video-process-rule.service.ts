import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoProcessRule } from '../../../entity/VideoProcessRule';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../../../helpers/base.service';

@Injectable()
export class VideoProcessRuleService extends BaseService {
    private _convertHost = 'http://localhost:8083';
    constructor(private _httpClient: HttpClient) {
        super();
    }

    addRule(rule: VideoProcessRule): Observable<VideoProcessRule> {
        return this._httpClient.post(`${this._convertHost}/rule`, rule)
            .pipe(
                map<any, VideoProcessRule>(res => res.data as VideoProcessRule),
                catchError(this.handleError)
            );
    }

    listRulesByBangumi(bangumiId: string): Observable<VideoProcessRule[]> {
        return this._httpClient.get(`${this._convertHost}/rule/bangumi/${bangumiId}`)
            .pipe(
                map<any, VideoProcessRule[]>(res => res.data as VideoProcessRule[]),
                catchError(this.handleError)
            );
    }

    editRule(rule: VideoProcessRule): Observable<VideoProcessRule> {
        return this._httpClient.put(`${this._convertHost}/rule/${rule.id}`, rule)
            .pipe(
                map<any, VideoProcessRule>(res => res.data as VideoProcessRule),
                catchError(this.handleError)
            );
    }

    deleteRule(ruleId: string): Observable<any> {
        return this._httpClient.delete(`${this._convertHost}/rule/${ruleId}`)
            .pipe(
                catchError(this.handleError)
            );
    }
}
