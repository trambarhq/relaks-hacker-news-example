import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import { FrontEnd } from 'front-end';

window.addEventListener('load', initialize);

function initialize(evt) {
    let container = document.getElementById('react-container');
    let element = React.createElement(FrontEnd);
    ReactDOM.render(element, container);
}
