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
    return (match && match[7].length == 11) ? match[7] : false;
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

export function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

