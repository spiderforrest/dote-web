import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from '../context/dote-context-objects.js';
import {Items} from '../../util/Items.js';

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
        <h4>Create Item</h4>
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
        <label for="add-edit-item-dialog-relationships"><strong>Relationships: </strong></label>
        <p>placeholder, gonna have to make an item selection dialog element or something</p>
        <button>Add Item</button>
        <button @click="${this._handleCloseDialog}">cancel</button>
      `;
    }

    if (this.operationType === "edit") {
      popupContent = html`
        <h4>Modifying Item {iteminfohere}</h4>
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
        <label for="add-edit-item-dialog-relationships"><strong>Relationships: </strong></label>
        <p>placeholder, gonna have to make an item selection dialog element or something</p>
        <button>Modify Item</button>
        <button @click="${this._handleCloseDialog}">cancel</button>
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
  `;

  // event listeners
  _handleCloseDialog() {
    const options = {
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent("userCloseAddEditDialog", options));
  }
}

customElements.define('dote-edit-item-dialog', DoteEditItemDialog);
