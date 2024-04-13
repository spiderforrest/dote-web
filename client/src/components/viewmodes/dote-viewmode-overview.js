import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from './../context/dote-context-objects.js';
import {Items} from '../../util/Items.js'

export class DoteViewmodeOverview extends LitElement {
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
    // once connected to DOM and context is available, fetch first 1000 items
    this.userData.userItems.fetch_range(0, 1000)
      .then((result) => this._userItemList = result)
      .catch((fail) => this._userItemList = "failure");
  }


  render() {
    // if results not yet available, display loading text
    if (this._userItemList === undefined) {
      return html`<p><i>fetching data...</i></p>`;
    }

    // if fetching data fails, display error
    if (this._userItemList === "failure") {
      return html`<p><b>Error: fetching data failed.</b></p>`;
    }

    if (this._userItemList.length === 0)
      return html`<p><i>No items.</i></p>`;
    else {
      return html`
        <section>
          <p>this is where the items go</p>
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

customElements.define('dote-viewmode-overview', DoteViewmodeOverview);
