import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from './../context/dote-context-objects.js';
import {Items} from '../../util/Items.js'

export class DoteViewmodeDebug extends LitElement {
  _userDataContext = new ContextConsumer(this, {context: userContextKey, subscribe: true});

  get userData() {
    return this._userDataContext.value;
  }

  // TODO: add loading state to delay render until data is pulled from server

  constructor() {
    super();
  }

  render() {
    const itemList = this.userData.userItems.get_cache();
    if (itemList.length === 0)
      return html`<p><i>No items.</i></p>`;
    else {
      return html`
        <section>
          <ul>
            ${itemList.map( (item) => html`<li>${JSON.stringify(item)}</li>` )}
          </ul>
          
          <button @click="${() => console.log(this.userData.userItems.get_cache())}">could you put it in the console instead please</button>
        </section>
      `;
    }
  }

  // styling =================================

  static styles = css`
    p {
      border: thin double teal;
    }
  `;
}

customElements.define('dote-viewmode-debug', DoteViewmodeDebug);
