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
    this.childrenMinimized = !this.childrenMinimized
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
            <p class="duedate-display">${new Date(this.itemData.due*1000).toLocaleString()}</p>
            `
          : // otherwise, note lack of due date
          html`
            <p class="duedate-display"><i>no target date set</i></p>
            `
        }
        <button class="dote-listmode-todo-itemcard-addchildbutton" type="button">
          <img src="https://placecats.com/64/64" alt="Add child item" height=64 width=64 class="addchildicon" />
        </button>
        <button class="dote-listmode-todo-itemcard-edititembutton" type="button">
          <img src="https://placecats.com/64/64" alt="Edit this item" height=64 width=64 class="edititemicon" />
        </button>
        <button class="dote-listmode-todo-itemcard-archiveitembutton" type="button">
          <img src="https://placecats.com/64/64" alt="Archive item" height=64 width=64 class="archiveitemicon" />
        </button>
        <button class="dote-listmode-todo-itemcard-moreactionsbutton" type="button">
          <img src="https://placecats.com/64/64" alt="More actions" height=64 width=64 class="moreactionsbutton" />
        </button>
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
        border-top: thin solid grey;
        border-right: thin solid grey;
        border-left: thin solid grey;
        border-radius: 0.6em 0.6em 0 0;
      }

      .dote-listmode-todo-itemcard-topbar > .completioncheckbox {
        margin-right: 1em;
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
        padding: 0.05em 0.25em 0.05em 0.25em;
      }

      .dote-listmode-todo-itemcard-bodytoggle > .bodytextdisplay {
        padding: 0.15em 0.25em 0.15em 0.25em;
      }

      .dote-listmode-todo-itemcard-bottombar {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
        align-items: center;
        padding: 0 0.5em 0 0.5em;
        border: thin solid grey;
        border-radius: 0 0 0.6em 0.6em;
      }

      .dote-listmode-todo-itemcard-bottombar > .duedate-display {
        flex: 1.5 0 80%;
        margin: 0;
      }

      .dote-listmode-todo-itemcard-bottombar > button {
        height: 1.5em;
        width: 1.5em;
        flex: 0 1 4%;
        border-left: thin solid grey;
        border-right: thin solid grey;
        margin-left: 0.2em;
        margin-right: 0.2em;
      }

      .dote-listmode-todo-itemcard-bottombar > button > img {
        height: 1.5em;
        width: 1.5em;
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
    this.childrenMinimized = true;
    super.connectedCallback();
  }

  render() {
    // the HTML content displayed in the item UI section where the tag's children go 
    let childContentEl = undefined;
    // the HTML content displayed directly beneath the tag title, displays item body data if present
    let bodyContentEl = undefined;
    // the footer displayed under the list of the tag's children, containing an "add child item" button
    let footerContentEl = undefined;
    // the toggle for showing/hiding list of children
    let showChildrenToggleEl = undefined;

    // if error loading item data
    if (this._thisItemLoadingError)
      return html`<p><strong>error loading item!</strong></p>`;

    // if not finished loading, display loading message
    if (this._thisItemLoading)
      return html`<p><i>loading item...</i></p>`;

    // once loaded
    // if this item has body data create an element for it
    if (typeof this.itemData.body === "string") {
      // create the body element and populate it with the tag's body data
      bodyContentEl = html`
        <details class="dote-listmode-tag-itemcard-bodytoggle">
          <summary>${this.itemData.body.substring(0, 50)+"..."}</summary>
          <p class="dote-itemcard-body-data">
            ${this.itemData.body}
          </p>
        </details>`
    } else {
      // otherwise, the element should open the inline body editor
        bodyContentEl = html`
          <details class="dote-listmode-tag-itemcard-bodytoggle">
            <summary><i>click to add body data</i></summary>
            <p>the inline editor will go here</p>
          </details>`
    }

    // if item has children...
    if (this.itemData.children.length > 0) {
      // render a toggle button for showing/hiding list of children
      showChildrenToggleEl = html`<button class="toggle-show-children-button" type="button" @click="${this._toggleChildrenMinimized}">${this.childrenMinimized ? "►" : "▼"}</button>`;
      // if children are currently minimized, render minimized list
      if (this.childrenMinimized === true) {
        childContentEl = html`
          <section class="children-list">
            <p class="children-list-minimized">${this.itemData.children.length+" children"}</p>
          </section>
        `;
      } else {
          // if not minimized, render full list
          childContentEl = html`
          <section class="children-list">
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
          </section>
          `;
      }
    } else
      childContentEl = undefined;

    return html`
        ${showChildrenToggleEl}
        <section class="dote-listmode-tag-itemcard-rightside">
          <section class="dote-listmode-tag-itemcard-topbar">
            <h3 class="titledisplay">${this.itemData.title+" (tag)"}</h3>
            <button class="dote-listmode-tag-itemcard-moreactions">more actions</button>
          </section>
          ${bodyContentEl}
          ${childContentEl}
          <section class="dote-listmode-tag-itemcard-bottombar">
            <button class="add-child-button" type="button">add child</button>
          </section>
        </section>
    `;
  }

    // styling ===============
    static styles = css`
      :host {
        display: flex;
        flex-flow: row nowrap;
        align-items: stretch;
        gap: 1%;
        margin-bottom: 0.25%;
        margin-top: 0.25%;
        padding-top: 0.15%;
        padding-bottom: 0.15%;
      }

      .dote-itemcard-childrentoggle {
        margin-left: 0.25%;
        margin-right: 0.25%;
        flex: 0 0 5%;
      }

      .toggle-show-children-button {
        flex: 1 1 5%;
      }

      .dote-listmode-tag-itemcard-rightside {
        flex: 2 1 95%;
      }

      .dote-listmode-tag-itemcard-topbar {
        display: flex;
        flex-flow: row nowrap;
        gap: 1%;
        align-items: center;
        justify-content: space-between;
        border-top: thin solid grey;
        border-left: thin solid grey;
        border-right: thin solid grey;
        border-radius: 0.6em 0.6em 0 0;
      }

      .dote-listmode-tag-itemcard-bottombar {
        display: flex;
        flex-flow: row nowrap;
        border: thin solid grey;
        border-radius: 0 0 0.6em 0.6em;
        justify-content: center;
      }

      .dote-listmode-tag-itemcard-topbar > .titledisplay {
        flex: 4 0 65%;
        text-align: center;
        margin: 0 0 0 0;
      }

      .dote-listmode-tag-itemcard-bodytoggle {
        padding-left: 1%;
        padding-right: 1%;
        border-left: thin solid grey;
        border-right: thin solid grey;
        border-bottom: thin solid grey;
      }

      summary {
        color: grey;
        font-style: italic;
      }

      .dote-itemcard-body-data {
        border: thin solid gold;
        margin-bottom: 0.25em;
        margin-top: 0.25em;
        padding-left: 0.5em;
        background-color: lightgrey;
      }
      
      .children-list {
        border-left: thin dashed grey;
        border-right: thin dashed grey;
        padding-right: 1%;
        padding-left: 1%;
      }

      .children-list-minimized {
        margin: 0 0 0 0;
        font-style: italic;
        color: grey;
      }
    `;
}

customElements.define("dote-list-viewmode-tag-item", DoteListViewmodeTagItem);
