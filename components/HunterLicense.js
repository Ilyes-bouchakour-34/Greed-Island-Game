export class HunterLicense {
    constructor() {
        this.load();
    }

    load() {
        const data = localStorage.getItem('hxh_license');
        if (data) {
            this.profile = JSON.parse(data);
        } else {
            this.profile = null;
        }
    }

    save(profileData) {
        this.profile = profileData;
        localStorage.setItem('hxh_license', JSON.stringify(this.profile));
    }

    hasLicense() {
        return this.profile !== null;
    }

    getNenColor() {
        if (!this.profile) return '#ffffff';
        const colors = {
            'Enhancer': '#ffaa00',
            'Transmuter': '#cc00ff',
            'Emitter': '#ff3333',
            'Conjurer': '#00ffcc',
            'Manipulator': '#aaaaaa',
            'Specialist': '#0033ff'
        };
        return colors[this.profile.nenType] || '#ffffff';
    }
}
