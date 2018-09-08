import _ from 'lodash';

export function sleep(time) {
    /* 
    usage in async function 
    await sleep(3000);
    */
    return new Promise(resolve => setTimeout(resolve, time));
}

export function playSound(source) {
    var audio = new Audio(source);

    return new Promise((resolve) => {
        audio.onended = () => resolve();
        audio.play();
    });
}

export function parseYoutubeURL(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}


export function createStoreKey(elements) {
    return elements.join('_');
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandomProperty(obj) {
    var keys = Object.keys(obj);
    return obj[keys[keys.length * Math.random() << 0]];
};

export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function sliceByIndices(a, indices) {
    if (!indices) return a;
    const b = indices.map(i => a[i]);
    return b;
}

export function isSubset(aSubset, aSuperset) {
    return _.every(aSubset, (val, key) => _.isEqual(val, aSuperset[key]));
}

export function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function flattenMessages(nestedMessages, prefix = '') {
    return Object.keys(nestedMessages).reduce((messages, key) => {
        let value = nestedMessages[key];
        let prefixedKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'string') {
            messages[prefixedKey] = value;
        } else {
            Object.assign(messages, flattenMessages(value, prefixedKey));
        }

        return messages;
    }, {});
}


