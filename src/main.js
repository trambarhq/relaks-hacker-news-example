import 'regenerator-runtime/runtime';
import 'preact/devtools';
import { h, render } from 'preact';
import { FrontEnd } from 'front-end';

window.addEventListener('load', initialize);

function initialize(evt) {
    let container = document.getElementById('react-container');
    let element = h(FrontEnd);
    render(element, container);
}
