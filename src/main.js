import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import { Application } from 'application';

window.addEventListener('load', initialize);

function initialize(evt) {
    let appContainer = document.getElementById('app-container');
    if (!appContainer) {
        throw new Error('Unable to find app element in DOM');
    }
    let appElement = React.createElement(Application);
    ReactDOM.render(appElement, appContainer);
}
