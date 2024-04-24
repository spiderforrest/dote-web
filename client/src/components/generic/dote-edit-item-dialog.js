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
    // check if setting via attribute overrides this
    
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() { 



    return html`
      <section class="dote-add-edit-item-dialog-popup">
        <h4>${this.operationType === "add" ? "Create Item" : "Edit Item"}</h4>
      </section>
    `;
  }

  // styling =================================
  static styles = css`

  `;
}

customElements.define('dote-edit-item-dialog', DoteEditItemDialog);
