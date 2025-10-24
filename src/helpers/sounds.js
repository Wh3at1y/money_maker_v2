// src/helpers/sounds.js
class SoundManager {
    constructor() {
        this.sounds = {}; // base audio elements
        this.playing = {}; // name -> Set of active Audio nodes
    }

    load(name, src, volume = 1) {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.volume = volume;
        this.sounds[name] = audio;
        this.playing[name] = new Set();
    }

    // play returns the audio instance used (so caller can further control it if needed)
    play(name, { volume } = {}) {
        const base = this.sounds[name];
        if (!base) return null;

        // clone to allow overlap
        const node = base.cloneNode(true);
        if (volume !== undefined) node.volume = volume;
        node.play().catch(() => {});
        this.playing[name].add(node);

        // remove from playing set when ended or paused
        const cleanup = () => {
            node.pause();
            node.currentTime = 0;
            this.playing[name].delete(node);
            node.removeEventListener("ended", cleanup);
            node.removeEventListener("pause", cleanup);
        };
        node.addEventListener("ended", cleanup);
        node.addEventListener("pause", cleanup);

        return node;
    }

    // stops all active instances for a given sound name
    stop(name) {
        const set = this.playing[name];
        if (!set) return;
        // copy to avoid mutation while iterating
        Array.from(set).forEach((node) => {
            try {
                node.pause();
                node.currentTime = 0;
            } catch (e) {
                /* ignore */
            }
            set.delete(node);
        });
    }

    // stop all sounds
    stopAll() {
        Object.keys(this.playing).forEach((name) => this.stop(name));
    }
}

const soundManager = new SoundManager();
export default soundManager;