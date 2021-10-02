import { Pipe, PipeTransform } from '@angular/core';

const profileTypeMapping = {
    'default': 'Default',
    'sound_only': 'Sound Only',
    'video_only': 'Video Only',
    'custom': 'Custom'
};

@Pipe({name: 'ProfileType'})
export class ProfileTypePipe implements PipeTransform {
    transform(value: any, ...args: any[]): any {
        return profileTypeMapping[value] || value;
    }
}
