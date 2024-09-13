// Component that renders viewmode selector bar, utility bar, and currently displayed viewmode.

import { LitElement, css, html } from "lit";
import { ContextConsumer } from "@lit/context";

import { userContextKey } from "./context/dote-context-objects.js";
import { DoteViewmodeDebug } from "./viewmodes/dote-viewmode-debug.js";
import { DoteListViewmode } from "./viewmodes/list/dote-list-viewmode.js";
import { Items } from "../util/Items.js";

export class DoteViewmode extends LitElement {
  // context, getters, and properties =======================
  _userDataConsumer = new ContextConsumer(this, {
    context: userContextKey
  });

  get userContext() {
    return this._userDataConsumer.value;
  }

  static properties = {
    currentViewmode: {type: String},
    userData: {},
    _viewmodeList: {state: true},
    _viewmodeDisplayNameList: {state: true},
  };

  constructor() {
    super();
    // load all available viewmodes, store list of display names
    // TODO: implement setting for choosing what viewmodes display and which is default
    // for now, doing it manually
    this._viewmodeList = [
      {displayName: 'DEBUG', elementName: 'dote-viewmode-debug'},
      {displayName: 'LIST', elementName: 'dote-list-viewmode'},
    ];

    // set to default viewmode
    this.currentViewmode = 'NONE';
  }

  // render and helper functions ======================
  render() {
    let currentViewmodeElement;
    switch (this.currentViewmode) {
      case 'DEBUG':
        currentViewmodeElement = html`<dote-viewmode-debug></dote-viewmode-debug>`;
        break;
      case 'LIST':
        currentViewmodeElement = html`<dote-list-viewmode></dote-list-viewmode>`;
        break;
      default:
        currentViewmodeElement = html`<p><i>Select a viewmode.</i></p>`;
    }

    // Selector for different viewmodes
    let viewmodeSelectorEl = html`
      <nav>
        <ul class="dote-viewmode-selector-list">
          ${this._viewmodeList
            // render out list of available modes w/separator chars between them
            .map((viewmode, index) => {
              return html`
                <li
                  @click="${this._switchCurrentViewmode}"
                  class=${viewmode.displayName === this.currentViewmode
                    ? 'dote-selected-viewmode'
                    : 'dote-not-selected-viewmode'}
                  data-viewmode=${viewmode.displayName}
                >
                  ${viewmode.displayName}
                </li>
                ${index !== this._viewmodeList.length - 1 ? ' | ' : ''}
              `;
            })}
        </ul>
      </nav>
      <hr/>`;

    return html`
      ${viewmodeSelectorEl}
      <section class="dote-viewmode-container">
        ${currentViewmodeElement}
      </section>
    `;
  }

  // handler for clicking on a viewmode
  _switchCurrentViewmode(e) {
    this.currentViewmode = e.target.dataset.viewmode;
  }

  // styling =================================

  static styles = css`
    .dote-viewmode-selector-list {
      list-style: none;
    }

    .dote-selected-viewmode {
      border: darkgray dashed thick;
      display: inline;
      margin-left: 1em;
      margin-right: 1em;
    }

    .dote-not-selected-viewmode {
      display: inline;
      margin-left: 1em;
      margin-right: 1em;
    }
  `;

  // event handlers ==================================================
  //
}

customElements.define("dote-viewmode", DoteViewmode);
