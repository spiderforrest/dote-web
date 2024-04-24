import {LitElement, css, html} from 'lit';
import {ContextProvider, ContextConsumer} from '@lit/context';

import {userContextKey} from './context/dote-context-objects.js';
import {DoteSidebarMenu} from './dote-sidebar-menu.js';
import {DoteViewmodeSelector} from './dote-viewmode-selector.js';
import {DoteAuth} from './dote-auth.js';
import {DoteEditItemDialog} from './generic/dote-edit-item-dialog.js';

export class DoteClient extends LitElement {
  // context, getters, and properties =======================
  _userDataConsumer = new ContextConsumer(this, {
    context: userContextKey,
    subscribe: true,
  });

  static properties = {
    _addOrEditItemDialogOpen: {type: Boolean, state: true},
    _addOrEditItemData: {state: true}
  };

  get userData() {
    return this._userDataConsumer.value;
  }


  // constructor and lifecycle methods =======================
  constructor() {
    super();
    this.addOrEditItemDialogOpen = false;
  }

  // render and event listeners =====================
  render() {
    let fromBottomDialogPanel = undefined;
    if (this.addOrEditItemDialogOpen) {
      fromBottomDialogPanel = html`<dote-edit-item-dialog operationType=${this._addOrEditItemData.buttonClicked} existingItemData=${this._addOrEditItemData.existingItemData}></dote-edit-item-dialog>`
    }


    if (this.userData.userLoggedIn === false) {
      return html`<dote-auth></dote-auth>`;
    } else {
      return html`
        <dote-sidebar-menu></dote-sidebar-menu>
        <dote-viewmode-selector @userAddOrEditItemGeneric=${this._openAddOrEditItemDialog}></dote-viewmode-selector>
        ${fromBottomDialogPanel}
      `;
    }
  }

  _openAddOrEditItemDialog(e) {
    this.addOrEditItemDialogOpen = true;
    this._addOrEditItemData = e.detail;
  }

  _closeAddOrEditItemDialog(e) {
    this.addOrEditItemDialogOpen = false;
  }
}

customElements.define('dote-client', DoteClient);
