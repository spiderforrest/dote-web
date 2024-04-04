import {LitElement, css, html} from 'lit';
import {ContextProvider, ContextConsumer} from '@lit/context';

import {userContextKey} from './context/dote-context-objects.js';
import {DoteClient} from './dote-client.js';

export class DoteClientRoot extends LitElement {

  static properties = {
    userContext: {}
  };
  
  // all context lives here
  _userDataProvider = new ContextProvider(this, {
    context: userContextKey,
    initialValue: { username: "" }
  });

  set userContext(value) {
    this._userContext = value;
    this._userDataProvider.setValue(value);
  }

  get userContext() {
    return this._userContext;
  }

  render() {
    return html`
      <dote-client></dote-client>
    `;
  }
}

customElements.define('dote-client-root', DoteClientRoot);
