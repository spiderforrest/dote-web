import {LitElement, css, html} from 'lit';
import {ContextProvider, ContextConsumer} from '@lit/context';

import {userContextKey} from './context/dote-context-objects.js';
import {DoteSidebarMenu} from './dote-sidebar-menu.js';
import {DoteViewmodeSelector} from './dote-viewmode-selector.js';
import {DoteAuth} from './dote-auth.js';

export class DoteClient extends LitElement {

  _userDataConsumer = new ContextConsumer(this, {
    context: userContextKey,
    subscribe: true});

  get userData() {
    return this._userDataConsumer.value;
  }

  constructor() {
    super();
  }


  render() {
    if (this.userData.username === undefined) {
      return html`<dote-auth></dote-auth>`;
    } else {
    return html`
      <dote-sidebar-menu></dote-sidebar-menu>
      <dote-viewmode-selector></dote-viewmode-selector>
      `;
    }
  }
}

customElements.define('dote-client', DoteClient);
