import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from './../context/dote-context-objects.js';
import {Items} from '../../util/Items.js'

export class DoteViewmodeDebug extends LitElement {
  _userDataContext = new ContextConsumer(this, {context: userContextKey, subscribe: true});

  get userData() {
    return this._userDataContext.value;
  }

  constructor() {
    super();
  }

  render() {
    // fetch everything from server
    // this.userData.userItems.fetch_range(1, 1000);
    return html`
      <section>
        <ul>
          ${this.userData.userItems.get_cache().map( (item) => html`<li>${JSON.stringify(item)}</li>` )}
        </ul>

        <button @click="${() => console.log(this.userData.userItems.get_cache())}">boot</button>
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
