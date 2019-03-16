const baseURL = 'https://hacker-news.firebaseio.com/v0'
const cache = {};

async function get(uri) {
	let result = cache[uri];
	if (!result) {
	    const url = baseURL + uri;
	    const response = await window.fetch(url);
	    result = cache[uri] = await response.json();
	}
    return result;
}

export { 
	get 
};
