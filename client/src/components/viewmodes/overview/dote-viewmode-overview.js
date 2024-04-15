import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from '../../context/dote-context-objects.js';
import {Items} from '../../../util/Items.js'
import {DoteViewmodeOverviewItem} from './dote-viewmode-overview-item.js';

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
    // once connected to DOM and context is available, fetch top-level items
    // that is, those that are parents of children, but don't have parents of their own
    this.userData.userItems.fetch_root()
      .then((result) => {
        this._userItemList = result;
        console.log("top-level items: ", result);
      })
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
      // render list of top-level items and give them each their own individual component
      // these individual components will then create additional components for each of their children
      // and then those children will render components for their children
      // circle of life, baby
      return html`
        <section>
          <dote-viewmode-overview-item .itemData=${this._userItemList[0]}></dote-viewmode-overview-item>
        </section>
      `;
    }
  }

  // styling =================================

  static styles = css`
    p {
      border: thin double grey;
    }
  `;
}

customElements.define('dote-viewmode-overview', DoteViewmodeOverview);
