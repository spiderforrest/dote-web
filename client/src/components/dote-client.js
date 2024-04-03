import {LitElement, css, html} from 'lit';
import {ContextProvider} from '@lit/context';

import {userContextKey} from './context/dote-context-objects.js';
import {DoteSidebarMenu} from './dote-sidebar-menu.js';

export class DoteClient extends LitElement {

  static properties = {
    userContext: {}
  };

  constructor() {
    super();
    this._provider = new ContextProvider(this, {userContextKey});
    this.userContext = "stonk";
  }

  set userContext(value) {
    this._userContext = value;
    this._provider.setValue(value);
  }

  get userContext() {
    return this._userContext;
  }

  render() {
    return html`<dote-sidebar-menu></dote-sidebar-menu>`;
  }
}

customElements.define('dote-client', DoteClient);
