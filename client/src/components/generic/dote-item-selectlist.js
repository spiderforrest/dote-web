// Dropdown list that retrieves all of a user's items and allows them to select an arbitrary number of them.

import { LitElement, css, html } from "lit";
import { ContextConsumer } from "@lit/context";

import { userContextKey } from "../context/dote-context-objects.js";
import { Items } from "../../util/Items.js";

export class DoteItemSelectlist extends LitElement {
  // context, getters, and properties =======================
  _userDataContext = new ContextConsumer(this, {
    context: userContextKey,
    subscribe: true,
  });

  // NOTE: context not accessible in constructor--only after component mounts to DOM
  get userData() {
    return this._userDataContext.value;
  }

  // constructor and lifecycle methods =======================
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  // render and styling ========================================
  render() {
    let itemSelectListEl;
    if (this.userData.userItems.get_all().length < 1) {
      itemSelectListEl = html`<p><i>No items</i></p>`;
    } else {
      itemSelectListEl = html`
        <select multiple size=10 class="dote-itemselectlist">
          ${this._userData.userItems.get_all().map(
            (item) =>
              html`<option
                label=${item.title}
                value=${item.id}
              >
                ${item.title} | ${item.type}
              </option>`)}
        </select>`
    }
    return itemSelectListEl;
  }

}

customElements.define("dote-item-selectlist", DoteItemSelectlist);
