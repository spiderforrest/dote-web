import { LitElement, css, html } from "lit";
import { ContextConsumer } from "@lit/context";

import { userContextKey } from "../context/dote-context-objects.js";
import { Items } from "../../util/Items.js";

// Generic item element for rendering cascading list-style viewmodes.
// Renders item that can show/hide item bodies and children.
export class DoteListViewmodeItem extends LitElement {
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

      // TODO: conditional rendering based on if/if not tag is logic ported from overview viewmode--
      // now that item is generic, we should rewrite/get rid of this
      //
      // if item has children, create elements for them,
      // either minimized or maximized depending on item state
      if (this.itemData.children.length > 0) {
        this.childrenMinimized
          ? (minimizedChildrenEl = html`<p
              class="dote-itemcard-minimized-children"
            >
              <i>(${this.itemData.children.length} children)</i>
            </p>`)
          : (childContentEl = this.itemData.children.map((childId) => {
              // if the item whose children we're rendering is a tag,
              // DON'T render child if the child has a parent that's not also tagged by this tag
              // this is so an indirect child of a tag doesn't render twice (once as direct child of the tag,
              // once as direct child of that same tag's child)
              // if (this.itemData.type === "tag") {
              //   // turns out this is not as simple as .includes()
              //   // so: get the kid, then check the all of the kids parents
              //   // if their only parents are tags, they aren't being rendered anywhere else(except in
              //   // another tag but that's wanted) and need to be rendered
              //   let shouldRender = true;
              //   const child = this.userData.userItems.get_item(childId);
              //   for (const parentId of child.parents) {
              //     // check every parent
              //     const parent = this.userData.userItems.get_item(parentId);
              //     if (
              //       parent.type !== "tag" &&
              //       parent.parents.includes(this.itemData.id)
              //     )
              //       shouldRender = false; // if any aren't a tag, don't render
              //   }

              //   if (shouldRender) {
              //     return html`<dote-list-viewmode-item
              //       itemid=${childId}
              //       itemdepth=${this.itemDepth + 1}
              //     >
              //     </dote-list-viewmode-item>`;
              //   } else {
              //     return null;
              //   }
              // } else {
                // if the item whose children we're rendering isn't a tag,
                // we don't need to worry about it
                return html`<dote-list-viewmode-item
                  itemid=${childId}
                  itemdepth=${this.itemDepth + 1}
                >
                </dote-list-viewmode-item>`;
              // }
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

  static styles = css`
    :host {
      display: block;
      border-left: thin solid grey;
      border-bottom: thin solid grey;
      border-top: thin dashed lightgray;
      border-radius: 0 0 0 1em;
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

    .dote-itemcard-minimized-children {
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

customElements.define("dote-list-viewmode-item", DoteListViewmodeItem);


