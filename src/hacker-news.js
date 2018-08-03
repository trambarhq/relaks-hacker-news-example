import Memoizee from 'memoizee';

const baseURL = 'https://hacker-news.firebaseio.com/v0'

let get = Memoizee(async function(uri) {
    let url = baseURL + uri;
    let response = await window.fetch(url);
    let result = await response.json();
    return result;
});

export { get };
