import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from '../../context/dote-context-objects.js';
import {Items} from '../../../util/Items.js';
import {DoteViewmodeOverviewItem} from './dote-viewmode-overview-item.js';

export class DoteViewmodeOverview extends LitElement {
  _userDataContext = new ContextConsumer(this, {
    context: userContextKey,
    subscribe: true,
  });

  // NOTE: context not accessible in constructor--only after component mounts to DOM
  get userData() {
    return this._userDataContext.value;
  }

  static properties = {
    _userItemList: {state: true},
    tagColors: {}
  };

  constructor() {
    super();
    this._userItemList = undefined;
  }

  connectedCallback() {
    super.connectedCallback();

    // once connected to DOM and context is available, fetch top-level items
    // that is, those that are parents of children, but don't have parents of their own
    this.userData.userItems
      .query(
        JSON.stringify({
          queries: [
            {
              type: 'match',
              logic: 'AND',
              field: 'parents',
              value: [],
            },
          ],
        })
      )
      .then((result) => {
        this._userItemList = result;
        // console.log("top-level items: ", result);
      })
      .catch((fail) => {
        this._userItemList = 'failure';
        console.log("fetch failed: ", fail);
      });
  }

  // TODO: add top command bar for finding/adding/modifying items
  render() {
    let itemElements = undefined;

    // if results not yet available, display loading text
    if (this._userItemList === undefined) {
      return html`<p class="dote-overview-loadingtext"><i>fetching data...</i></p>`;
    }

    // if fetching data fails, display error
    if (this._userItemList === 'failure') {
      return html`<p class="dote-overview-errortext"><b>Error: fetching data failed.</b></p>`;
    }

    // top utility bar with item sorting controls, other tools
    const utilityBar = html`<p>hi mom</p><hr>`;
    
    console.log(this._userItemList);
    // if parentless items exist, create the elements for them
    if (this._userItemList.length > 0) {
      // render list of top-level items and give them each their own individual component
      // these individual components will then create additional components for each of their children
      // and then those children will render components for their children
      // circle of life, baby
      itemElements = html`
        ${this._userItemList.map(
          (item) =>
            html`<dote-viewmode-overview-item
              itemid=${item.id}
              itemdepth="0"
            ></dote-viewmode-overview-item>`
        )}
      `;
    } else {
      // if no items exist, display message notifying user
      itemElements = html`<p class="dote-overview-noitems"><i>No items.</i></p>`;
    }
    
    return html`
      ${utilityBar}
      ${itemElements}
    `;
  }

  // styling =================================

  static styles = css`
    p {
      border: thin double grey;
    }
  `;
}

customElements.define('dote-viewmode-overview', DoteViewmodeOverview);
