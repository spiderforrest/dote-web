import { LitElement, css, html } from "lit";
import { ContextConsumer } from "@lit/context";

import { userContextKey } from "../../context/dote-context-objects.js";
import { Items } from "../../../util/Items.js";

// Mixin for rendering cascading items in list-type viewmodes.
// Use to create subclasses for rendering specific item types.
const DoteListViewmodeItemMixin = (LitElement) => class extends LitElement {
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
    itemId: { type: Number },
    itemDepth: { type: Number },
    itemData: {},
    childrenMinimized: {},
    _thisItemLoading: { state: true },
    _thisItemLoadingError: { state: true },
  };

  // constructor and lifecycle methods =======================
  constructor() {
    super();
    this.bodyMinimized = true;
    this.childrenMinimized = true;
    this._thisItemLoading = true;
    this._thisItemLoadingError = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._thisItemLoading = false;
    this.itemData = this.userData.userItems.get_item(this.itemId);
  }

  // rendering performed in extended subclasses for different itemtypes

  // styling ===============
  // these items may be overridden by subclasses below.
  // static styles = css`
  //   :host {
  //     display: block;
  //     border-left: thin solid grey;
  //     border-bottom: thin solid grey;
  //     border-top: thin dashed gray;
  //     border-radius: 0 0 0 1em;
  //     margin-left: 0.75em;
  //     margin-bottom: 0.25em;
  //     margin-top: 0.25em;
  //     padding-left: 0.5em;
  //     padding-top: 0.15em;
  //     padding-bottom: 0.15em;
  //   }
  //
  //   .dote-itemcard-childrentoggle {
  //     margin-left: 0.25em;
  //     margin-right: 0.25em;
  //   }
  //
  //   .dote-itemcard-title {
  //     margin-left: 0.25em;
  //   }
  //
  //   .dote-itemcard-body-data {
  //     border: thin solid gold;
  //     margin-bottom: 0.25em;
  //     margin-top: 0.25em;
  //     padding-left: 0.5em;
  //     background-color: lightgrey;
  //   }
  //
  //   .dote-itemcard-ctime {
  //     font-size: 0.8em;
  //     font-style: italic;
  //   }
  //
  //   .dote-itemcard-minimized-children {
  //     margin: 0.25em 0em 0.25em 1em;
  //   }
  // `;

  // event handlers ==================================================
  _toggleChildrenMinimized() {
    this.childrenMinimized = !this.childrenMinimized;
  }

  _toggleBodyMinimized() {
    this.bodyMinimized = !this.bodyMinimized;
  }
}

// Component for rendering todo items in a cascading list-style viewmode.
export class DoteListViewmodeTodoItem extends DoteListViewmodeItemMixin(LitElement) {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    // the HTML content displayed in the item UI section where an item's children go when it's open
    let childContentEl = undefined;
    // the HTML content displayed directly beneath the item title, displays item body data if present
    let bodyContentEl = undefined;

    // if error loading item data
    if (this._thisItemLoadingError)
      return html`<p><strong>error loading item!</strong></p>`;

    // if not finished loading, display loading message
    if (this._thisItemLoading) {
      return html`<p><i>loading item...</i></p>`;
    } else {
      // once loaded
      // if this item has body data and it's toggled to display, create element for it
      if (typeof this.itemData.body === "string") {
        // create an element with the data if it's present
        bodyContentEl = html`
          <details class="dote-listmode-todo-itemcard-bodytoggle">
            <summary>${this.itemData.body.substring(0, 50)+"..."}</summary>
            <p class="bodytextdisplay">
              ${this.itemData.body}
            </p>
          </details>`
        } else { // otherwise, have this element open the inline body editor
          bodyContentEl = html`
            <details class="dote-listmode-todo-itemcard-bodytoggle">
              <summary><i>click to add body data</i></summary>
              <p>the inline editor will go here</p>
            </details>`
        }
    }

    // if item has children, render the element for them
    if (this.itemData.children.length > 0) {
        childContentEl = html`
          <details class="dote-listmode-todo-itemcard-childrenlist">
            <summary>${this.itemData.children.length+" children"}</summary>
            ${this.itemData.children.map((childId) => {
              // create different element for each child depending on its type
              const childItem = this.userData.userItems.get_item(childId);
              switch (childItem.type) {
                case 'todo':
                  return html`<dote-list-viewmode-todo-item
                    itemid=${childItem.id}
                    itemdepth=${this.itemDepth + 1}
                  ></dote-list-viewmode-todo-item>`;
                case 'note':
                  return html`<dote-list-viewmode-note-item
                    itemid=${childItem.id}
                    itemdepth=${this.itemDepth + 1}
                  ></dote-list-viewmode-note-item>`;
                case 'tag':
                  return html`<dote-list-viewmode-tag-item
                    itemid=${childItem.id}
                    itemdepth=${this.itemDepth + 1}
                  ></dote-list-viewmode-tag-item>`;
              }
            })}
          </details>
      `;
    } else {
      childContentEl = undefined;
    }

    return html`
      <section class="dote-listmode-todo-itemcard-topbar">
        <input type="checkbox" class="completioncheckbox" />
        <h3 class="titledisplay">${this.itemData.title}</h3>
        <p class="itemtypedisplay">${this.itemData.type} | </p>
        <p class="utimedisplay">utime goes here once it's implemented</p>
      </section>
      ${bodyContentEl}
      <section class="dote-listmode-todo-itemcard-bottombar">
        ${this.itemData.due !== undefined
          ? // if this item has a specified due date, display it
          html`
            <p class="dote-listmode-todo-itemcard-duedate-display">${new Date(this.itemData.due*1000).toLocaleString()}</p>
            `
          : // otherwise, display nothing
          undefined}
        <button class="dote-listmode-todo-itemcard-addchildbutton" type="button">add child button placeholder</button>
        <span>more action-for-this-item buttons will go here</span>
      </section>
      ${childContentEl}
    `;
    }

    // styling ==================
    static styles = css`
      :host {
        display: block;
        margin-left: 0.4em;
        margin-bottom: 0.25em;
        margin-top: 0.25em;
        padding-top: 0.15em;
        padding-bottom: 0.15em;
      }

      summary {
        color: grey;
        font-style: italic;
      }

      .dote-listmode-todo-itemcard-topbar {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: center;
        padding: 0.15em 0.25em 0.15em 0.25em;
        border-bottom: thin solid grey;
        border-top: thin solid grey;
        border-right: thin solid grey;
        border-left: thin solid grey;
        border-radius: 0.6em 0.6em 0 0;
      }

      .dote-listmode-todo-itemcard-topbar > p {
        margin: 0 0 0 0;
      }
      
      .dote-listmode-todo-itemcard-topbar > .completioncheckbox {
        flex: 0 0 auto;
      }

      .dote-listmode-todo-itemcard-topbar > .titledisplay {
        flex: 4 0 65%;
        margin: 0 0 0 0;
      }

      .dote-listmode-todo-itemcard-topbar > .itemtypedisplay {
        flex: 0 0 auto;
      }

      .dote-listmode-todo-itemcard-topbar > .utimedisplay {
        flex: 0 0 auto;
      }

      .dote-listmode-todo-itemcard-bodytoggle {
        border-left: thin solid grey;
        border-right: thin solid grey;
        padding: 0.15em 0.25em 0.15em 0.25em;
      }

      .dote-listmode-todo-itemcard-bodytoggle > .bodytextdisplay {
        padding: 0.15em 0.25em 0.15em 0.25em;
      }

      .dote-listmode-todo-itemcard-bottombar {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: center;
        padding: 0 0.25em 0 0.25em;
        border: thin solid grey;
        border-radius: 0 0 0.6em 0.6em;
      }

      .dote-listmode-todo-itemcard-childrenlist {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: center;
        padding: 0.1em 0.1em 0.1em 0.1em;
        border-bottom-left-radius: 0.6em;
        border-left: thin dashed grey;
        border-bottom: thin dashed grey;
      }

    `;
  }

customElements.define("dote-list-viewmode-todo-item", DoteListViewmodeTodoItem);

// Component for rendering note items in a cascading list-style viewmode.
export class DoteListViewmodeNoteItem extends DoteListViewmodeItemMixin(LitElement) {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

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
    if (this._thisItemLoading) {
      return html`<p><i>loading item...</i></p>`;
    } else {
      // once loaded
      // if this item has body data and it's toggled to display, create element for it
      if (this.itemData.body && this.bodyMinimized === false) {
        bodyContentEl = html`<p class="dote-itemcard-body-data">
          ${this.itemData.body}
        </p>`;
      }

      // if item has children, render them minimized/unminimized depending on state
      if (this.itemData.children.length > 0) {
        this.childrenMinimized
          ? (minimizedChildrenEl = html`<p
              class="dote-itemcard-minimized-children"
            >
              <i>(${this.itemData.children.length} children)</i>
            </p>`)
          : (childContentEl = this.itemData.children.map((childId) => {
              // create element for each child item if unminimized, varying based on its type
              const childItem = this.userData.userItems.get_item(childId);
              switch (childItem.type) {
                case 'todo':
                  return html`<dote-list-viewmode-todo-item
                    itemid=${childItem.id}
                    itemdepth=${this.itemDepth + 1}
                  ></dote-list-viewmode-todo-item>`;
                  break;
                case 'note':
                  return html`<dote-list-viewmode-note-item
                    itemid=${childItem.id}
                    itemdepth=${this.itemDepth + 1}
                  ></dote-list-viewmode-note-item>`;
                  break;
                case 'tag':
                  return html`<dote-list-viewmode-tag-item
                    itemid=${childItem.id}
                    itemdepth=${this.itemDepth + 1}
                  ></dote-list-viewmode-tag-item>`;
                  break;
              }
            }));
      }
    }

    return html`
      ${this.itemData.children.length > 0
        ? html`<a
            @click="${this._toggleChildrenMinimized}"
            class="dote-itemcard-childrentoggle"
            >${this.childrenMinimized === true
              ? html`<strong>𑾰</strong>`
              : "━"}</a
          >`
        : html`<a class="dote-itemcard-childrentoggle">●</a>`}
      <span class="dote-itemcard-title"
        ><strong>${this.itemData.title}</strong> |
      </span>
      <span class="dote-itemcard-type">${this.itemData.type} | </span>
      ${this.itemData.body
        ? html`<span
            class="dote-itemcard-bodytoggle"
            @click="${this._toggleBodyMinimized}"
            >${this.bodyMinimized ? "≢ " : "≡ "}|
          </span>`
        : undefined}
      <span class="dote-itemcard-depth"
        >depth: ${this.itemDepth} |
      </span>
      <span class="dote-itemcard-ctime"
        ><em
          >created:
          ${new Date(this.itemData.created * 1000).toLocaleString()}</em
        ></span
      >
      ${bodyContentEl}
      ${this.childrenMinimized === false ? childContentEl : minimizedChildrenEl}
    `;
    }

    // styling ===============
    static styles = css`
      :host {
        display: block;
        border-left: medium double grey;
        border-bottom: medium double grey;
        border-top: medium solid gray;
        margin-left: 0.75em;
        margin-bottom: 0.25em;
        margin-top: 0.25em;
        padding-left: 0.5em;
        padding-top: 0.15em;
        padding-bottom: 0.15em;
      }

      .dote-itemcard-childrentoggle {
        margin-left: 0.25em;
        margin-right: 0.25em;
      }

      .dote-itemcard-title {
        margin-left: 0.25em;
      }

      .dote-itemcard-body-data {
        border: thin solid gold;
        margin-bottom: 0.25em;
        margin-top: 0.25em;
        padding-left: 0.5em;
        background-color: lightgrey;

      .dote-itemcard-ctime {
        font-size: 0.8em;
        font-style: italic;
      }
    `;
  }

customElements.define("dote-list-viewmode-note-item", DoteListViewmodeNoteItem);

// Component for rendering tag items in cascading list-style viewmodes.
export class DoteListViewmodeTagItem extends DoteListViewmodeItemMixin(LitElement) {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

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
    if (this._thisItemLoading) {
      return html`<p><i>loading item...</i></p>`;
    } else {
      // once loaded
      // if this item has body data and it's toggled to display, create element for it
      if (this.itemData.body && this.bodyMinimized === false) {
        bodyContentEl = html`<p class="dote-itemcard-body-data">
          ${this.itemData.body}
        </p>`;
      }

      // if item has children, render them minimized/unminimized depending on state
      if (this.itemData.children.length > 0) {
        this.childrenMinimized
          ? (minimizedChildrenEl = html`<p
              class="dote-itemcard-minimized-children"
            >
              <i>(${this.itemData.children.length} children)</i>
            </p>`)
          : (childContentEl = this.itemData.children.map((childId) => {
              // create element for each child item if unminimized, varying based on its type
              const childItem = this.userData.userItems.get_item(childId);
              switch (childItem.type) {
                case 'todo':
                  return html`<dote-list-viewmode-todo-item
                    itemid=${childItem.id}
                    itemdepth=${this.itemDepth + 1}
                  ></dote-list-viewmode-todo-item>`;
                  break;
                case 'note':
                  return html`<dote-list-viewmode-note-item
                    itemid=${childItem.id}
                    itemdepth=${this.itemDepth + 1}
                  ></dote-list-viewmode-note-item>`;
                  break;
                case 'tag':
                  return html`<dote-list-viewmode-tag-item
                    itemid=${childItem.id}
                    itemdepth=${this.itemDepth + 1}
                  ></dote-list-viewmode-tag-item>`;
                  break;
              }
            }));
      }
    }

    return html`
      ${this.itemData.children.length > 0
        ? html`<a
            @click="${this._toggleChildrenMinimized}"
            class="dote-itemcard-childrentoggle"
            >${this.childrenMinimized === true
              ? html`<strong>𑾰</strong>`
              : "━"}</a
          >`
        : html`<a class="dote-itemcard-childrentoggle">●</a>`}
      <span class="dote-itemcard-title"
        ><strong>${this.itemData.title}</strong> |
      </span>
      <span class="dote-itemcard-type">${this.itemData.type}  | </span>
      ${this.itemData.body
        ? html`<span
            class="dote-itemcard-bodytoggle"
            @click="${this._toggleBodyMinimized}"
            >${this.bodyMinimized ? "≢ " : "≡ "}|
          </span>`
        : undefined}
      <span class="dote-itemcard-depth"
        >depth: ${this.itemDepth} |
      </span>
      <span class="dote-itemcard-ctime"
        ><em
          >created:
          ${new Date(this.itemData.created * 1000).toLocaleString()}</em
        ></span
      >
      ${bodyContentEl}
      ${this.childrenMinimized === false ? childContentEl : minimizedChildrenEl}
    `;
    }

    // styling ===============
    static styles = css`
      :host {
        display: block;
        border-left: thick dashed grey;
        border-bottom: thick dashed grey;
        border-top: thick dashed grey;
        margin-left: 0.75em;
        margin-bottom: 0.25em;
        margin-top: 0.25em;
        padding-left: 0.5em;
        padding-top: 0.15em;
        padding-bottom: 0.15em;
      }

      .dote-itemcard-childrentoggle {
        margin-left: 0.25em;
        margin-right: 0.25em;
      }

      .dote-itemcard-title {
        margin-left: 0.25em;
      }

      .dote-itemcard-body-data {
        border: thin solid gold;
        margin-bottom: 0.25em;
        margin-top: 0.25em;
        padding-left: 0.5em;
        background-color: lightgrey;
      }

      .dote-itemcard-ctime {
        font-size: 0.8em;
        font-style: italic;
      }
    `;
  }

customElements.define("dote-list-viewmode-tag-item", DoteListViewmodeTagItem);
