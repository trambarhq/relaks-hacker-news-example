import 'regenerator-runtime/runtime';
import 'preact/devtools';
import { h, render } from 'preact';
import { Application } from 'application';

window.addEventListener('load', initialize);

function initialize(evt) {
    let appContainer = document.getElementById('app-container');
    if (!appContainer) {
        throw new Error('Unable to find app element in DOM');
    }
    let appElement = h(Application);
    render(appElement, appContainer);
}
