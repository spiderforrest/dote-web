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
    this.itemData = undefined;
  }

  connectedCallback() {
    super.connectedCallback();

    // get and store the data for this item's direct children, if it has any
    this.userData.userItems.fetch_recursive(this.itemData.id, 2)
      .then((result) => {
        console.log(result);
        this._directChildren = result;
      })
      .catch(() => this._directChildren = "failure");
    }

  render() {
    return html`
      <section class="dote-overview-itemcard">
      <span>${this.itemData.title} | </span>
      <span>${this.itemData.type} | </span>
      <span>(bodytoggle) | </span>
      <span><em>created: ${new Date(this.itemData.created).toString()}</em></span>
      </section>
      `;
  }

  static styles = css`
    .dote-overview-itemcard {
      border-left: thin solid grey;
      border-bottom: thin solid grey;
    }
  `;
}

customElements.define('dote-viewmode-overview-item', DoteViewmodeOverviewItem);
