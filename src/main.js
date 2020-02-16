import 'preact/devtools';
import { h, render } from 'preact';
import { FrontEnd } from './front-end.jsx';

window.addEventListener('load', initialize);

function initialize(evt) {
  const container = document.getElementById('react-container');
  const element = h(FrontEnd);
  render(element, container);
}
