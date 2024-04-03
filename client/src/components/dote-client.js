import {LitElement, css, html} from 'lit';
import {ContextProvider} from '@lit/context';

import {userContextKey} from './context/dote-context-objects.js';
import {DoteSidebarMenu} from './dote-sidebar-menu.js';
import {DoteViewmodeSelector} from './dote-viewmode-selector.js';

export class DoteClient extends LitElement {
  _userDataProvider = new ContextProvider(this, {
    context: userContextKey,
    initialValue: "stonks"
  });

  set userContext(value) {
    this._userContext = value;
    this._userDataProvider.setValue(value);
  }

  get userContext() {
    return this._userContext;
  }

  static properties = {
    userContext: {}
  };

  constructor() {
    super();
  }


  render() {
    console.log(this.userContext);
    return html`
      <dote-sidebar-menu></dote-sidebar-menu>
      <dote-viewmode-selector></dote-viewmode-selector>
      `;
  }
}

customElements.define('dote-client', DoteClient);
