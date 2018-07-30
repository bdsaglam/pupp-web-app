import _ from "lodash";
import { sleep } from "./Utils";

const VOICE_CONFIGS = [
    {
        name: "Google US English",
        options: {
            volume: 1,
            rate: 0.7,
            pitch: 1,
            lang: "en-US",
        }
    },
    {
        name: "Google UK English Male",
        options: {
            volume: 1,
            rate: 0.7,
            pitch: 1,
            lang: "en-GB",
        }
    },
    {
        name: "Samantha",
        options: {
            volume: 1,
            rate: 0.6,
            pitch: 1.5,
            lang: "en-US",
        }
    }
];

class SpeechSynthesizer {
    constructor(options) {
        this.defaults = {
            volume: 1,
            rate: 0.7,
            pitch: 1,
            lang: "en-US",
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

// getVoices workaround
var VOICES = [];
if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = e => {
        const vs = window.speechSynthesis.getVoices();
        if (vs.length > 0) VOICES = vs;
        window.speechSynthesis.onvoiceschanged = null;
    };
} else {
    console.warn("The current browser does not support the speechSynthesis API.");
}

function getVoices() {
    const arr = window.speechSynthesis.getVoices();
    const voices = arr.length > 0 ? arr : VOICES;
    return voices;
};

// selects a preferred voice if available
function pickVoice(voices, configs) {
    for (const config of configs) {
        for (const voice of voices) {
            if (voice.name === config.name) {
                return Object.assign({}, { voice: voice }, config.options);
            }
        }
    }
    return {};
};

var instance;
function getSpeaker() {
    if (!("speechSynthesis" in window)) {
        console.warn("The current browser does not support the speechSynthesis API.");
        return;
    }

    const voiceNames = _.map(VOICE_CONFIGS, "name");
    // if no instance or instance voice does not match
    if (!instance || !voiceNames.includes(instance.options.voice.name)) {
        const voices = getVoices();
        const options = pickVoice(voices, VOICE_CONFIGS);
        instance = new SpeechSynthesizer(options);
    }
    instance.activate();
    return instance;
}

export default getSpeaker;