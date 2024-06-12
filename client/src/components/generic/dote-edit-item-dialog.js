// Popup dialog that allows users to add a new item or edit an existing one.

import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from '../context/dote-context-objects.js';
import {Items} from '../../util/Items.js';
import {DoteItemSelectlist} from './dote-item-selectlist.js';

export class DoteEditItemDialog extends LitElement {
  static properties = {
    // either "add" or "edit", specifies whether creating new item or editing existing
    operationType: {type: String},
    // item field/value pairs to have already set in dialog, either for editing existing item or default values for new item
    startingItemData: {}
  }

  constructor() {
    super();
    this.operationType = "add"; // default to add new item if not specified via attribute
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() { 
    // Set up add/edit dialogue HTML elements, whichever one is applicable
    let popupContent;
    if (this.operationType === "add") {
      popupContent = html`
        <h4 class="add-edit-item-dialog-popuptitle">Create Item</h4>
        <hr/>
        <label for="add-edit-item-dialog-itemtype"><strong>Item Type: </strong></label>
          <select
            id="add-edit-item-dialog-itemtype"
            name="add-edit-item-dialog-itemtype"
            required
          >
            <option value="todo" selected>Task</option>
            <option value="note">Note</option>
            <option value="tag">Tag</option>
          </select>
        <hr/>
        <input type="text" id="add-edit-item-dialog-title" placeholder="item title..." />
        <hr/>
        <textarea id="add-edit-item-dialog-body" placeholder="item body..."></textarea>
        <hr/>
        <div class="add-edit-item-dialog-relationships-section">
          <h3><strong>Relationships: </strong></h3>
            <h4>Parents of this item:</h4>
            <dote-item-selectlist></dote-item-selectlist>
            <hr/>
            <h4>Children of this item:</h4>
            <dote-item-selectlist></dote-item-selectlist>
        </div>
        <hr/>
        <button>Add Item</button>
        <button @click="${this._handleCloseDialog}">Cancel and discard item</button>
      `;
    }

    if (this.operationType === "edit") {
      popupContent = html`
        <h4 class="add-edit-item-dialog-popuptitle">Modifying Item {iteminfohere}</h4>
        <hr/>
        <label for="add-edit-item-dialog-itemtype"><strong>Item Type: </strong></label>
          <select
            id="add-edit-item-dialog-itemtype"
            name="add-edit-item-dialog-itemtype"
            required
          >
            <option value="todo" selected>Task</option>
            <option value="note">Note</option>
            <option value="tag">Tag</option>
          </select>
        <hr/>
        <input type="text" id="add-edit-item-dialog-title" placeholder="item title..." />
        <hr/>
        <textarea id="add-edit-item-dialog-body" placeholder="item body..."></textarea>
        <hr/>
        <h6><strong>Relationships: </strong></h6>
        <p>placeholder, gonna have to make an item selection dialog element or something</p>
        <hr/>
        <button>Modify Item</button>
        <button @click="${this._handleCloseDialog}">Cancel and discard changes</button>
      `;
    }

    return html`
      <section class="dote-add-edit-item-dialog-popup">
        ${popupContent}
      </section>
    `;
  }

  // styling =================================
  static styles = css`
    .dote-add-edit-item-dialog-popup {
      position: fixed;
      bottom: 0; left: 2em; right: 2em;
      padding: .5em .15em .5em;
      line-height: .1em;
      text-align: center;
      min-width: 80%;
      max-width: 100%;
      max-height: 80%;
      border: thin dotted darkgray;
      background-color: lightgray;
    }

    .add-edit-item-dialog-popuptitle {
      margin-top: .5em;
      margin-bottom: .5em;
    }
  `;

  // event listeners =========================
  
  // for closing dialog without creating/modifying item, discarding changes
  _handleCloseDialog() {
    const options = {
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent("userCloseAddEditDialog", options));
  }
}

customElements.define('dote-edit-item-dialog', DoteEditItemDialog);
