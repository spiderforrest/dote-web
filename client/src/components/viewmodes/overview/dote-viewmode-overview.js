// Overview viewmode component--see design docs for details.
  
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

  connectedCallback() {
    super.connectedCallback();

    // once connected to DOM and context is available, fetch "top-level" items;
    // that is, those that are displayed without parents in the current overview settings
    this._userItemList = this.userData.userItems.query([
      { type: "match", logic: "OR", field: "type", value: "tag" },
      { type: "match", logic: "OR", field: "parents", value: [] },
    ]);
    console.log(this._userItemList);
  }

  // render and styling ========================================
  render() {
    let itemElements = undefined;

    // If results not yet available, display loading text
    if (this._userItemList === undefined) {
      return html`<p class="dote-overview-loadingtext">
        <i>fetching data...</i>
      </p>`;
    }

    // If fetching data fails, display error.
    if (this._userItemList === "failure") {
      return html`<p class="dote-overview-errortext">
        <b>Error: fetching data failed.</b>
      </p>`;
    }

    // if parentless items exist, create the elements for them
    if (this._userItemList.length > 0) {
      // Render list of items that are set to display without parents 
      // and give them each their own individual component.
      // These individual components will then create additional components for each of their children,
      // and then those children will render components for their children.
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

    return html`${itemElements}`;
  }

  // styling =================================

  static styles = css`
    .dote-overview-errortext {
      border: thick dashed lightred;
      background-color: pink;
    }

    .dote-overview-noitems {
      border: thick dashed grey;
      background-color: lightgray;
    }
  `;
}

customElements.define("dote-viewmode-overview", DoteViewmodeOverview);
