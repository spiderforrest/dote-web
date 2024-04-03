import {LitElement, css, html} from 'lit';
import {ContextProvider} from '@lit/context';

import {userContext} from 'context/dote-context-objects.js';

export class DoteClient extends LitElement {

  static properties = {};

  constructor() {
    super();
    console.log("hi mom");
  }

  render() {
    return html`<p>hi it's me i'm a client</p>`;
  }
}

customElements.define('dote-client', DoteClient);
