const baseURL = 'https://hacker-news.firebaseio.com/v0'

async function fetch(uri) {
    let url = baseURL + uri;
    let response = await window.fetch(url);
    let result = await response.json();
    return result;
}

let promises = {};

function get(uri) {
    let promise = promises[uri];
    if (!promise) {
        promise = promises[uri] = fetch(uri);
    }
    return promise;
}

export { get };
