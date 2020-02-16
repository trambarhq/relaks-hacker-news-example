const baseURL = 'https://hacker-news.firebaseio.com/v0'
const cache = {};

async function get(uri) {
  let promise = cache[uri];
  if (!promise) {
    promise = cache[uri] = fetchJSON(baseURL + uri);
  }
  return promise;
}

async function fetchJSON(url) {
  const response = await fetch(url);
  return response.json();
}

export {
  get
};
