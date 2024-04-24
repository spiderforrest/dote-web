import {LitElement, css, html} from 'lit';
import {ContextProvider, ContextConsumer} from '@lit/context';

import {userContextKey} from './context/dote-context-objects.js';
import {DoteSidebarMenu} from './dote-sidebar-menu.js';
import {DoteViewmodeSelector} from './dote-viewmode-selector.js';
import {DoteAuth} from './dote-auth.js';
import {DoteEditItemDialog} from './generic/dote-edit-item-dialog.js';

export class DoteClient extends LitElement {
  _userDataConsumer = new ContextConsumer(this, {
    context: userContextKey,
    subscribe: true,
  });

  static properties = {
    addOrEditItemDialogOpen: {}
  };

  get userData() {
    return this._userDataConsumer.value;
  }

  constructor() {
    super();
    this.addOrEditItemDialogOpen = false;
  }

  // render and event listeners =====================
  render() {
    const fromBottomDialogPanel = undefined;
    if (this.addOrEditItemDialogOpen) {
      this.fromBottomDialogPanel = html`<DoteEditItemDialog></DoteEditItemDialog>`
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
  }
}

customElements.define('dote-client', DoteClient);
