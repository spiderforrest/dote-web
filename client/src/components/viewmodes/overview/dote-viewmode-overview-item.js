import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from '../../context/dote-context-objects.js';
import {Items} from '../../../util/Items.js';

export class DoteViewmodeOverviewItem extends LitElement {
  // context, getters, and properties =======================
  _userDataContext = new ContextConsumer(this, {
    context: userContextKey,
    subscribe: true,
  });

  // NOTE: context not accessible in constructor--only after component mounts to DOM
  get userData() {
    return this._userDataContext.value;
  }

  static properties = {
    bodyMinimized: {},
    itemId: {},
    itemDepth: {},
    itemData: {},
    childrenMinimized: {},
    _thisItemLoading: {},
    _thisItemLoadingError: {},

    // _directCompleteChildren: {},
    // _directIncompleteChildren: {},
    // _childrenLoaded: {},
    // _childrenLoadingError: {}
  };
  
  // constructor and lifecycle methods =======================
  constructor() {
    super();
    this.bodyMinimized = true;
    this.childrenMinimized = true;
    this._thisItemLoading = true;
    this._thisItemLoadingError = false;
    console.log("(constructor) itemid: ", this.itemId);
    // this._directDoneChildren = [],
    // this._directNotDoneChildren = [];
    // this._childrenLoaded = false;
    // this._childrenLoadingError = false;
  }

  connectedCallback() {
    super.connectedCallback();

    // get and store the data for this item's direct children, if it has any
    // TODO: update this code so that the item only gets its own data
    // and spawns children by using `get_id()`
    this.userData.userItems
      .get_item(this.itemId)
        .then((item) => {
          console.log("(callback) itemid: ", this.itemId);
          console.log("(callback) item: ", item);
          console.log("all cached items: ", this.userData.userItems.get_cache());
          this.itemData = item;
        })
      // .get_recursive(this.itemData.id, 2)
      // .then((result) => {
      //   // filter out the current item, then sort items that are done and those that aren't
      //   this._directNotDoneChildren = result.filter(
      //     (item) => item.id !== this.itemData.id && item.done === false
      //   );
      //   this._directDoneChildren = result.filter(
      //     (item) => item.id !== this.itemData.id && item.done === true
      //   );
      //   this._childrenLoaded = true;
      //   // console.log("id ", this.itemData.id, "'s direct children: ", this._directChildren);
      // })
        .catch(() => (this._thisItemLoadingError = true));

    this._thisItemLoading = false;
  }
  
  // render and styling ========================================
  render() {
    // the HTML content displayed in the item UI section where an item's children go when it's open
    let childContentEl = undefined;
    // the HTML content displayed in the item UI section where an item's children go when it's minimized
    let minimizedChildrenEl = undefined;
    // the HTML content displayed directly beneath the item title, displays item body data
    let bodyContentEl = undefined;

    // if error loading item data
    if (this._thisItemLoadingError)
      return html`<p><strong>error loading item!</strong></p>`;

    // if not finished loading, display loading message
    if (this._thisItemLoading === true) {
      return html`<p><i>loading item...</i></p>`;
    } else {
      // once loaded
      // if this item has body data and it's toggled to display, create element for it
      if (this.itemData.body && !this.bodyMinimized)
        bodyContentEl = html`<p class="dote-overview-itemcard-body-data">${this.itemData.body}</p>`;

      // if item has children, create elements for them,
      // either minimized or maximized depending on item state
      if (this.itemData.children.length > 0) {
        this.childrenMinimized
          ? minimizedChildrenEl = html`<p><i>(${this.itemData.children.length} direct children)</i></p>`
          : childContentEl = this.itemData.children.map((child) => 
            html`<dote-viewmode-overview-item
              .itemId=${child}
              .itemDepth=${this.itemDepth + 1}>
            </dote-viewmode-overview-item>`)
      }
    }
    // if error loading children, display error message
    // if (this._childrenLoadingError === true) {
    //   childContent = html`<p><strong><i>error loading children.</i></strong></p>`;
    //   minimizedChildrenList = html`<p><i>error loading children.</i></p>`;
    // }

    // if not yet loaded, display loading message
    // if (this._thisItemLoading === true) {
    //   childContent = html`<p><i>loading children...</i></p>`;
    //   minimizedChildrenList = html`<p><i>children loading...</i></p>`;
    // } else {
    //     // once loaded
    //     // if this item has body data, create element for it
    //     this.itemData.body ?
    //       bodyContent = html`<p class="dote-overview-itemcard-body-data">${this.itemData.body}</p>` :
    //       bodyContent = undefined;
    //     // if this item has no children, render nothing
    //     if ( (this._directNotDoneChildren.length + this._directDoneChildren.length) < 1) {
    //       childContent = undefined;
    //       minimizedChildrenList = undefined;
    //     } else {
    //       // If the item does have children, create compressed "children hidden" UI element for them
    //       minimizedChildrenList = html`<p @click="${this._toggleChildrenMinimized}" class="dote-overview-itemcard-minimized-children-list"><i>(${this._directNotDoneChildren.length} incomplete, ${this._directDoneChildren.length} complete children hidden)</i></p>`;
    //
    //       // Create elements to render if child list is not minimized
    //       childContent = 
    //         html`
    //           <section class="dote-overview-itemcard-expanded-children-list">
    //             ${this._directNotDoneChildren.map(
    //               (child) => html`
    //                 <dote-viewmode-overview-item .itemData=${{...child, depth: this.itemData.depth + 1}}></dote-viewmode-overview-item>
    //             `)}
    //           </section>
    //       `;
    //     }
    // }

    return html`
      ${
        this.itemData.children.length > 0
          ? html`<a @click="${this._toggleChildrenMinimized}" class="dote-overview-itemcard-childrentoggle">${this.childrenMinimized === true ? "╋" : "━"}</a>`
          : html`<a class="dote-overview-itemcard-childrentoggle">●</a>`
      }
      <span class="dote-overview-itemcard-title"><strong>${this.itemData.title}</strong> | </span>
      <span class="dote-overview-itemcard-type">${this.itemData.type} | </span>
      ${(this.itemData.body !== undefined)
          ? html`<span class="dote-overview-itemcard-bodytoggle" @click="${this._toggleBodyMinimized}">${this.bodyMinimized ? "≢ " : "≡ "}| </span>`
          : undefined}
      <span class="dote-overview-itemcard-depth">depth: ${this.itemDepth} | </span>
      <span class="dote-overview-itemcard-ctime"><em>created: ${new Date(this.itemData.created*1000).toLocaleString()}</em></span>
      ${bodyContentEl}
      ${this.childrenMinimized === false ? childContentEl : minimizedChildrenEl}
    `;
  }

  static styles = css`
    :host {
      display: block;
      border-left: thin solid grey;
      border-bottom: thin solid grey;
      border-radius: 0 0 0 1em;
      margin-left: 1em;
      margin-bottom: 0.25em;
      padding-left: 0.5em;
    }

    .dote-overview-itemcard-childrentoggle {
      margin-left: .25em;
      margin-right: .25em;
    }

    .dote-overview-itemcard-title {
      margin-left: 0.25em;
    }

    .dote-overview-itemcard-body-data {
      border: thin solid gold;
      margin-bottom: 0.25em;
      margin-top: 0.25em;
      padding-left: 0.5em;
      background-color: lightgrey;
    }

    .dote-overview-itemcard-minimized-children-list {
      margin: 0.25em 0em 0.25em 1em;
    }
  `;

  // event handlers ==================================================
  _toggleChildrenMinimized() {
    this.childrenMinimized = !this.childrenMinimized;
  }

  _toggleBodyMinimized() {
    this.bodyMinimized = !this.bodyMinimized;
  }
}

customElements.define('dote-viewmode-overview-item', DoteViewmodeOverviewItem);
