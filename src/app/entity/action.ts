import { ActionType } from './action-type';

export class Action {
    type: ActionType;
    /**
     * output path from the previous action
     */
    public lastOutput: string;
    /**
     * the index of actions
     */
    public index: number;
}
