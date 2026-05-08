export class HunterLicense {
    constructor() {
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem('hxh_license');
            if (data) {
                this.profile = JSON.parse(data);
            } else {
                this.profile = null;
            }
        } catch (e) {
            console.warn("localStorage not available", e);
            this.profile = null;
        }
    }

    save(profileData) {
        this.profile = profileData;
        try {
            localStorage.setItem('hxh_license', JSON.stringify(this.profile));
        } catch (e) {
            console.warn("localStorage not available", e);
        }
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
