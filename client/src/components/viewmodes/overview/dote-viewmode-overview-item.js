import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from '../../context/dote-context-objects.js';
import {Items} from '../../../util/Items.js'

export class DoteViewmodeOverviewItem extends LitElement {
  _userDataContext = new ContextConsumer(this, {context: userContextKey, subscribe: true});

  // NOTE: context not accessible in constructor--only after component mounts to DOM
  get userData() {
    return this._userDataContext.value;
  }

  static properties = {
    showBody: {},
    itemData: {},
    _directChildren: {}
  };

  constructor() {
    super();
    this.showBody = false;
    this._directChildren = undefined;
  }

  connectedCallback() {
    super.connectedCallback();

    // get and store the data for this item's direct children, if it has any
    this.userData.userItems.fetch_recursive(this.itemData.id, 2)
      .then((result) => {
        this._directChildren = result.filter((item) => item.id !== this.itemData.id);
        console.log("id ", this.itemData.id, "'s direct children: ", this._directChildren);
      })
      .catch(() => this._directChildren = "failure");
    }

  render() {
    // the stuff displayed in the item UI section where an item's children go
    let childContent;

    // if not yet loaded, display loading message
    if (this._directChildren === undefined) {
      childContent = html`<p><i>loading children...</i></p>`;
    } else {
      // once loaded, if this item has no children, render nothing
      if (this._directChildren.length < 1) {
        childContent = undefined;
      } else {
        // finally, if the item does have children, create elements for them
        childContent = this._directChildren.map((child) => html`<dote-viewmode-overview-item .itemData=${child}></dote-viewmode-overview-item>`)
      }
    }
    
    return html`
      <section class="dote-overview-itemcard">
        <span>${this.itemData.title} | </span>
        <span>${this.itemData.type} | </span>
        <span>(bodytoggle) | </span>
        <span><em>created: ${new Date(this.itemData.created).toString()}</em></span>
        <hr>
        ${childContent}
      </section>
      `;
  }

  static styles = css`
    .dote-overview-itemcard {
      border-left: thin solid grey;
      border-bottom: thin solid grey;
      margin-left: 5px;
    }
  `;
}

customElements.define('dote-viewmode-overview-item', DoteViewmodeOverviewItem);
