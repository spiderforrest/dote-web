import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from './../context/dote-context-objects.js';
import {Items} from '../../util/Items.js'

export class DoteViewmodeDebug extends LitElement {
  _userDataContext = new ContextConsumer(this, {context: userContextKey, subscribe: true});

  // NOTE: context not accessible in constructor--only after component mounts to DOM
  get userData() {
    return this._userDataContext.value;
  }

  static properties = {
    _userItemList: {state: true},
  }

  constructor() {
    super();
    this._userItemList = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    // once connected to DOM and context is available, get all items
    this._userItemList = this.userData.userItems.get_all();
  }


  render() {
    if (this._userItemList.length === 0)
      return html`<p><i>No items.</i></p>`;
    else {
      return html`
        <section>
          <ul>
            ${this._userItemList.map( (item) => html`<li>${JSON.stringify(item)}</li>` )}
          </ul>
          
          <button @click="${() => console.log(this.userData.userItems.get_all())}">could you put it in the console instead please</button>
        </section>
      `;
    }
  }

  // styling =================================

  static styles = css`
    p {
      border: thin double teal;
    }
    
    ul {
      list-style: none
    }

    li {
      font-family: monospace;
    }
  `;
}

customElements.define('dote-viewmode-debug', DoteViewmodeDebug);
