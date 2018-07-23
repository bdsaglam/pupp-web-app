const DEFAULT_OPTIONS = {
    continuous: true,
    interimResults: false,
    lang: 'en-US'
};

class Recognizer {
    constructor(props) {
        this.props = props;
        this.isRunning = false;

        const SpeechRecognition = (window.SpeechRecognition
            || window.webkitSpeechRecognition
            || window.mozSpeechRecognition
            || window.msSpeechRecognition
            || window.oSpeechRecognition);

        if (SpeechRecognition != null) {
            this.recognition = this.createRecognition(SpeechRecognition);
            const events = [
                { name: 'start', action: this.props.onStart },
                { name: 'end', action: this.props.onEnd },
                { name: 'error', action: this.props.onError }
            ];

            events.forEach(event => {
                this.recognition.addEventListener(event.name, event.action);
            });

            this.recognition.addEventListener('result', this.onResult);
        } else {
            console.warn('The current browser does not support the SpeechRecognition API.');
        }
    }

    createRecognition = (SpeechRecognition) => {
        const options = Object.assign({}, DEFAULT_OPTIONS, this.props.options);

        let recognition = new SpeechRecognition();

        recognition.continuous = options.continuous;
        recognition.interimResults = options.interimResults;
        recognition.lang = options.lang;

        return recognition;
    }

    onResult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        this.props.onResult({ interimTranscript, finalTranscript });
    }

    start = () => {
        if (!this.isRunning) {
            this.recognition.start();
            this.isRunning = true;
        }
    }

    stop = () => {
        this.recognition.stop();
        this.isRunning = false;
    }

    abort = () => {
        this.recognition.abort();
        this.isRunning = false;
    }
}


export default Recognizer;