import { Action } from './action';
import { Condition } from './Condition';

export class VideoProcessRule {
    public id?: string;
    public name: string;
    public bangumiId: string;
    public videoFileId: string;
    public condition: Condition;

    public actions: Action[];

    public priority: number;
}
