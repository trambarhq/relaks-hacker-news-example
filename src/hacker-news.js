const baseURL = 'https://hacker-news.firebaseio.com/v0'

async function fetch(uri) {
  const url = baseURL + uri;
  const response = await window.fetch(url);
  const result = await response.json();
  return result;
}

const promises = {};

function get(uri) {
  let promise = promises[uri];
  if (!promise) {
    promise = promises[uri] = fetch(uri);
  }
  return promise;
}

export { get };
