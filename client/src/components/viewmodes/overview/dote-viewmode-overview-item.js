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
    itemData: {},
    childrenMinimized: {},
    _directCompleteChildren: {},
    _directIncompleteChildren: {},
    _childrenLoaded: {},
    _childrenLoadingError: {}
  };
  
  // constructor and lifecycle methods =======================
  constructor() {
    super();
    this.bodyMinimized = true;
    this.childrenMinimized = true;
    this._directDoneChildren = [],
    this._directNotDoneChildren = [];
    this._childrenLoaded = false;
    this._childrenLoadingError = false;
  }

  connectedCallback() {
    super.connectedCallback();

    // get and store the data for this item's direct children, if it has any
    this.userData.userItems
      .get_recursive(this.itemData.id, 2)
      .then((result) => {
        // filter out the current item, then sort items that are done and those that aren't
        this._directNotDoneChildren = result.filter(
          (item) => item.id !== this.itemData.id && item.done === false
        );
        this._directDoneChildren = result.filter(
          (item) => item.id !== this.itemData.id && item.done === true
        );
        this._childrenLoaded = true;
        // console.log("id ", this.itemData.id, "'s direct children: ", this._directChildren);
      })
      .catch(() => (this._childrenLoadingError = true));
  }
  
  // render and styling ========================================
  render() {
    // the HTML content displayed in the item UI section where an item's children go when it's open
    let childContent;
    // the HTML content displayed in the item UI section where an item's children go when it's minimized
    let minimizedChildrenList;
    // the HTML content displayed directly beneath the item title, displays item body data
    let bodyContent;

    // if error loading children, display error message
    if (this._childrenLoadingError === true) {
      childContent = html`<p><strong><i>error loading children.</i></strong></p>`;
      minimizedChildrenList = html`<p><i>error loading children.</i></p>`;
    }

    // if not yet loaded, display loading message
    if (this._childrenLoaded === false) {
      childContent = html`<p><i>loading children...</i></p>`;
      minimizedChildrenList = html`<p><i>children loading...</i></p>`;
    } else {
        // once loaded
        // if this item has body data, create element for it
        this.itemData.body ?
          bodyContent = html`<p class="dote-overview-itemcard-body-data">${this.itemData.body}</p>` :
          bodyContent = undefined;
        // if this item has no children, render nothing
        if ( (this._directNotDoneChildren.length + this._directDoneChildren.length) < 1) {
          childContent = undefined;
          minimizedChildrenList = undefined;
        } else {
          // If the item does have children, create compressed "children hidden" UI element for them
          minimizedChildrenList = html`<p class="dote-overview-itemcard-minimized-children-list"><a @click="${this._toggleChildrenMinimized}">${this.childrenMinimized === true ? "╋" : "━"}</a><i>(${this._directNotDoneChildren.length} incomplete, ${this._directDoneChildren.length} complete children hidden)</i></p>`;

          // Create elements to render if child list is not minimized
          childContent = 
            html`
              <section class="dote-overview-itemcard-expanded-children-list">
                <a @click="${this._toggleChildrenMinimized}">${this.childrenMinimized === true ? "╋" : "━"}</a>
                ${this._directNotDoneChildren.map(
                  (child) => html`
                    <dote-viewmode-overview-item .itemData=${{...child, depth: this.itemData.depth + 1}}></dote-viewmode-overview-item>
                `)}
              </section>
          `;
        }
    }

    return html`
      <span class="dote-overview-itemcard-title"><strong>${this.itemData.title}</strong> | </span>
      <span class="dote-overview-itemcard-type">${this.itemData.type} | </span>
      ${this.itemData.body
          ? html`<span class="dote-overview-itemcard-bodytoggle" @click="${this._toggleBodyMinimized}">${this.bodyMinimized ? "≢ " : "≡ "}| </span>`
          : undefined}
      <span class="dote-overview-itemcard-depth">depth: ${this.itemData.depth} | </span>
      <span class="dote-overview-itemcard-ctime"><em>created: ${new Date(this.itemData.created).toLocaleString()}</em></span>
      ${this.bodyMinimized === false ? bodyContent : undefined}
      ${this.childrenMinimized === false ? childContent : minimizedChildrenList}
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

    .dote-overview-itemcard-title {
      margin-left: 0.25em;
    }

    .dote-overview-itemcard-body-data {
      border: thin dashed gold;
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
