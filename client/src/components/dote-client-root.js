import {LitElement, css, html} from 'lit';
import {ContextProvider, ContextConsumer} from '@lit/context';

import {userContextKey} from './context/dote-context-objects.js';
import {Items} from '../util/Items.js';
import {DoteClient} from './dote-client.js';

export class DoteClientRoot extends LitElement {

  static properties = {
    userContext: {}
  };
  
  // user data context lives here
  _userDataProvider = new ContextProvider(this, {
    context: userContextKey,
    initialValue: { username: undefined, userUuid: undefined }
  });

  set userContext(value) {
    this._userContext = value;
    this._userDataProvider.setValue(value);
  }

  get userContext() {
    return this._userContext;
  }

  constructor() {
    super();
  }

  // render and event listeners =====================
  render() {
    return html`
      <dote-client @userLogin=${this._loginListener}></dote-client>
    `;
  }

  _loginListener(e) {
    // pull username and UUID from successful login, set in context
    this.userContext = e.detail;

    // then pull user data from server and store it in context
    //
  }
}

customElements.define('dote-client-root', DoteClientRoot);
