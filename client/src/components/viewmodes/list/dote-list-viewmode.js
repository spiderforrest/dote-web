// Generic component for viewmode that renders items in cascading list form.

import { LitElement, css, html } from "lit";
import { ContextConsumer } from "@lit/context";

import { userContextKey } from "../../context/dote-context-objects.js";
import { DoteListViewmodeTodoItem, DoteListViewmodeNoteItem, DoteListViewmodeTagItem } from "./dote-list-viewmode-item-mixin.js";
import { Items } from "../../../util/Items.js";

export class DoteListViewmode extends LitElement {
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
    _userItemList: { state: true },
    tagColors: {},
  };

  // constructor and lifecycle methods =======================
  constructor() {
    super();
    this._userItemList = undefined;
  }

  connectedCallback() {
    super.connectedCallback();

    // once connected to DOM and context is available, fetch "top-level" items;
    // that is, those that are displayed without parents in the current viewmode settings
    // this should not be default behavior as this component is meant to be for generic lists
    // leaving it for now while porting code from overview viewmode
    this._userItemList = this.userData.userItems.query([
      // { type: "match", logic: "OR", field: "type", value: "tag" },
      { type: "match", logic: "OR", field: "parents", value: [] },
    ]);
    console.log(this._userItemList);
  }

  // render and styling ========================================
  render() {
    let itemElements = undefined;

    // If results not yet available, display loading text
    if (this._userItemList === undefined) {
      return html`<p class="dote-list-viewmode-loadingtext">
        <i>fetching data...</i>
      </p>`;
    }

    // If fetching data fails, display error
    if (this._userItemList === "failure") {
      return html`<p class="dote-list-viewmode-errortext">
        <b>Error: fetching data failed.</b>
      </p>`;
    }

    // Top utility bar with item sorting controls, other tools
    let viewmodeUtilityBarEl = html`
      <nav class="dote-utilbar">
        <button
          @click="${this._handleCreateItem}"
          class="dote-utilbar-additem"
        >
          Add item (placeholder)
        </button>
        <button
          @click="${this._handleEditItem}"
          class="dote-utilbar-modifyitem"
        >
          Modify item (placeholder)
        </button>
        <span class="dote-utilbar-midspacer"></span>
        <div class="dote-utilbar-sortselect">
          <label for="sort-select">sort by (placeholder): </label>
          <select
            id="sort-select"
            name="sort-select"
            required
          >
            <option value="in-progress" selected>in progress</option>
            <option value="by-tag">by tag</option>
          </select>
        </div>
        <input
          class="dote-utilbar-searchbar"
          placeholder="search items...(placeholder)"
        />
      </nav>
      <hr />
    `;

    // If there are items to display, create elements for them
    if (this._userItemList.length > 0) {
      // Items rendered here recursively render their children;
      // thus, this component should render only the "top-level" parent items of
      // all items you wish to display in this viewmode
      itemElements = html`
        ${this._userItemList.map(
          (item) => {
            switch (item.type) {
              case 'todo':
                return html`<dote-list-viewmode-todo-item
                  itemid=${item.id}
                  itemdepth="0"
                ></dote-list-viewmode-todo-item>`;
                break;

              case 'note':
                return html`<dote-list-viewmode-note-item
                  itemid=${item.id}
                  itemdepth="0"
                ></dote-list-viewmode-note-item>`;
                break;

              case 'tag':
                return html`<dote-list-viewmode-tag-item
                  itemid=${item.id}
                  itemdepth="0"
                ></dote-list-viewmode-tag-item>`;
                break;
            }
          }
        )}
      `;
    } else {
      // if no items exist, display message notifying user
      itemElements = html`<p class="dote-list-viewmode-noitems">
        <i>No items.</i>
      </p>`;
    }

    return html`
      ${viewmodeUtilityBarEl}
      ${itemElements}
      `;
  }

  // styling =================================

  static styles = css`
    .dote-list-viewmode-errortext {
      border: thick dashed lightred;
      background-color: pink;
    }

    .dote-list-viewmode-noitems {
      border: thick dashed grey;
      background-color: lightgray;
    }

    .dote-utilbar {
      display: flex;
      flex-flow; row nowrap;
      justify-content: space-around;
      align-items: center;
      gap: 1em;
    }

    .dote-utilbar-additem {
      order: 1;
    }

    .dote-utilbar-modifyitem {
      order: 2;
    }

    .dote-utilbar-midspacer {
      order: 3;
      flex-grow: 1;
    }

    .dote-utilbar-sortselect {
      order: 4;
    }

    .dote-utilbar-searchbar {
      order: 5;
    }
  `;

  // event handlers ==================================================
  _handleCreateItem() {
    const options = {
      detail: {
        buttonClicked: "add",
      },
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent("userAddOrEditItemGeneric", options));
  }

  _handleEditItem() {
    // TODO: actually send the edited item info w/the event
    const options = {
      detail: {
        buttonClicked: "edit",
        existingItemData: "placeholder",
      },
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent("userAddOrEditItemGeneric", options));
  }
}

customElements.define("dote-list-viewmode", DoteListViewmode);
