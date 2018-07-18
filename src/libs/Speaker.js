import { sleep } from "./Utils";

class SpeechSynthesizer {
    constructor(options) {
        this.defaults = {
            text: '',
            volume: 1,
            rate: 0.7,
            pitch: 1,
            lang: 'en-US',
        };

        this.options = Object.assign({}, this.defaults, options);
        this.active = true;
    }

    activate = () => {
        this.active = true;
    }

    deactivate = () => {
        this.active = false;
    }

    createSpeech = () => {
        const options = this.options;

        let speech = new SpeechSynthesisUtterance();
        speech.volume = options.volume;
        speech.rate = options.rate;
        speech.pitch = options.pitch;
        speech.lang = options.lang;
        if (options.voice) {
            speech.voice = options.voice;
        }
        return speech;
    }

    aspeak = (text) => {
        if (!this.active) return;

        if (!text) {
            return;
        }
        var speech = this.createSpeech();
        speech.text = text;
        window.speechSynthesis.speak(speech);
    }

    speak = (text, timeOut = null) => {
        if (!this.active) return;

        if (!text) {
            return;
        }

        timeOut = timeOut || (text.length * 130 + 1000);

        var speech = this.createSpeech();
        speech.text = text;

        const speechTask = new Promise((resolve) => {
            speech.onend = (event) => resolve();
            window.speechSynthesis.speak(speech);
        });

        return Promise.race([speechTask, sleep(timeOut)]);
    }
}

function pickVoice(voices, choices) {
    const matches = voices.filter(v => choices.includes(v.name));
    for (const name of choices) {
        for (const voice of matches) {
            if (voice.name === name) {
                return voice;
            }
        }
    }
    return;
};


var VOICES = [];
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = e => {
        const vs = window.speechSynthesis.getVoices();
        if (vs.length > 0) VOICES = vs;
        window.speechSynthesis.onvoiceschanged = null;
    };
} else {
    console.warn('The current browser does not support the speechSynthesis API.');
}

var instance;
function getSpeaker() {
    if (!('speechSynthesis' in window)) {
        console.warn('The current browser does not support the speechSynthesis API.');
        return;
    }
    // TODO move to config file
    const choices = ["Google US English", "Samantha"];

    // if no instance or instance voice does not match
    if (!instance || !choices.includes(instance.options.voice.name)) {
        const arr = window.speechSynthesis.getVoices();
        const voices = arr.length > 0 ? arr : VOICES;
        const voice = pickVoice(voices, choices);
        instance = new SpeechSynthesizer({ voice: voice });
    }
    instance.activate();
    return instance;
}

export default getSpeaker;