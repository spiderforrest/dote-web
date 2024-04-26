import { LitElement, css, html } from "lit";
import { ContextConsumer } from "@lit/context";

import { userContextKey } from "../../context/dote-context-objects.js";
import { Items } from "../../../util/Items.js";
import { DoteViewmodeOverviewItem } from "./dote-viewmode-overview-item.js";

export class DoteViewmodeOverview extends LitElement {
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

  // TODO: Allie; check todo in _loginListener in dote-client-root.js;
  // this should be replaced since query() is no longer async
  connectedCallback() {
    super.connectedCallback();

    // once connected to DOM and context is available, fetch top-level items
    // that is, those that are parents of children, but don't have parents of their own
    //
    // TODO: dote item spec was updated so that tagged items must have tags as DIRECT parents,
    // and test data has been edited to reflect this.
    // This code should be updated to handle this--it currently recursively renders every child based on its "children" list,
    // so it's now rendering indirect children of tags twice--once as direct children of tag, once as direct children of their parent item

    this._userItemList = this.userData.userItems.query([
      { type: "match", logic: "OR", field: "type", value: "tag" },
      { type: "match", logic: "OR", field: "parents", value: [] },
    ]);
    console.log(this._userItemList);
    // .then((result) => {
    //   this._userItemList = result;
    //   // console.log("top-level items: ", result);
    // })
    // .catch((fail) => {
    //   this._userItemList = 'failure';
    //   console.log('fetch failed: ', fail);
    // });
  }

  // render and styling ========================================
  render() {
    let itemElements = undefined;

    // if results not yet available, display loading text
    if (this._userItemList === undefined) {
      return html`<p class="dote-overview-loadingtext">
        <i>fetching data...</i>
      </p>`;
    }

    // if fetching data fails, display error
    if (this._userItemList === "failure") {
      return html`<p class="dote-overview-errortext">
        <b>Error: fetching data failed.</b>
      </p>`;
    }

    // top utility bar with item sorting controls, other tools
    const utilityBar = html`
      <nav class="dote-overview-utilbar">
        <button
          @click="${this._handleCreateItem}"
          class="dote-overview-utilbar-additem"
        >
          Add item (placeholder)
        </button>
        <button
          @click="${this._handleEditItem}"
          class="dote-overview-utilbar-modifyitem"
        >
          Modify item (placeholder)
        </button>
        <span class="dote-overview-utilbar-midspacer"></span>
        <div class="dote-overview-utilbar-sortselect">
          <label for="overview-sort-select">sort by (placeholder): </label>
          <select
            id="overview-sort-select"
            name="overview-sort-select"
            required
          >
            <option value="in-progress" selected>in progress</option>
            <option value="by-tag">by tag</option>
          </select>
        </div>
        <input
          class="dote-overview-utilbar-searchbar"
          placeholder="search items...(placeholder)"
        />
      </nav>

      <hr />
    `;

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
      itemElements = html`<p class="dote-overview-noitems">
        <i>No items.</i>
      </p>`;
    }

    return html` ${utilityBar} ${itemElements} `;
  }

  // styling =================================

  static styles = css`
    .dote-overview-errortext {
      border: thick dashed lightred;
      background-color: pink;
    }

    .dote-overview-utilbar {
      display: flex;
      flex-flow; row nowrap;
      justify-content: space-around;
      align-items: center;
      gap: 1em;
    }

    .dote-overview-utilbar-additem {
      order: 1;
    }

    .dote-overview-utilbar-modifyitem {
      order: 2;
    }

    .dote-overview-utilbar-midspacer {
      order: 3;
      flex-grow: 1;
    }

    .dote-overview-utilbar-sortselect {
      order: 4;
    }

    .dote-overview-utilbar-searchbar {
      order: 5;
    }

    .dote-overview-noitems {
      border: thick dashed grey;
      background-color: lightgray;
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

customElements.define("dote-viewmode-overview", DoteViewmodeOverview);
