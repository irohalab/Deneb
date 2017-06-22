export class VideoPlayerHelpers {
    static isiOSDevice(): boolean {
        return (navigator.userAgent.match(/ip(hone|ad|od)/i) && !navigator.userAgent.match(/(iemobile)[\/\s]?([\w\.]*)/i));
    }

    static isMobileDevice(): boolean {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf("IEMobile") !== -1);
    }

    static calcSliderRatio(rect: ClientRect, event: MouseEvent): number {
        let offsetX = 0;
        if (event.clientX < rect.left) {
            offsetX = 0;
        } else if (event.clientX > rect.right) {
            offsetX = rect.width;
        } else {
            offsetX = event.clientX - rect.left;
        }
        return offsetX / rect.width;
    }

    static getExtname(url: string) {
        let parts = url.split('.');
        return parts[parts.length - 1];
    }


    static convertTime(timeInSeconds: number): string {
        let hours = Math.floor(timeInSeconds / 3600);
        let minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
        let seconds = Math.floor(timeInSeconds - hours * 3600 - minutes * 60);
        let mm, ss;
        if (minutes < 10) {
            mm = '0' + minutes;
        } else {
            mm = '' + minutes;
        }
        if (seconds < 10) {
            ss = '0' + seconds;
        } else {
            ss = '' + seconds;
        }
        if (hours > 0) {
            return `${hours}:${mm}:${ss}`;
        }
        return `${mm}:${ss}`;
    }
}
