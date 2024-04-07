import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from './../context/dote-context-objects.js';
import {Items} from '../../util/Items.js'

export class DoteViewmodeDebug extends LitElement {
  _userDataContext = new ContextConsumer(this, {context: userContextKey, subscribe: true});

  get userData() {
    return this._userDataContext.value;
  }

  static properties = {
    rawJSONUserData: {type: String},
  };

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        <p class="dote-viewmode-debug">${this.rawJSONUserData}</p>

        <button @click="${() => console.log(this.userData)}">boot</button>
      </section>
    `;
  }

  // styling =================================

  static styles = css`
    p {
      border: thin double teal;
    }
  `;
}

customElements.define('dote-viewmode-debug', DoteViewmodeDebug);
