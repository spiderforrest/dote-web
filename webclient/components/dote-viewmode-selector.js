import {LitElement, css, html} from 'lit';
import {map} from 'lit/directives/map.js';
import {classMap} from 'lit/directives/class-map.js';

import {DoteViewmodeDebug} from './viewmodes/dote-viewmode-debug.js';

export class DoteViewmodeSelector extends LitElement {

  // properties and constructor ======================
  static properties = {
    currentViewmode: {type: String},
    userData: {},
    _viewmodeList: {state: true},
    _viewmodeDisplayNameList: {state: true}
  };

  constructor() {
    super();
    // load all available viewmodes, store list of display names
    // TODO: implement setting for choosing what viewmodes display and which is default
    // for now, doing it manually
    this._viewmodeList = [
      { displayName: "DEBUG", elementName: "dote-viewmode-debug" },
      { displayName: "OVERVIEW", elementName: "dote-viewmode-overview" }
    ]

    // set to default viewmode
    this.currentViewmode = "DEBUG";
  }

  // render and helper functions ======================
  render() {
    let currentViewmodeElement;
    switch (this.currentViewmode) {
        case "DEBUG":
          currentViewmodeElement = html`<dote-viewmode-debug></dote-viewmode-debug>`;
          break;
        case "OVERVIEW":
          currentViewmodeElement = html`<dote-viewmode-overview></dote-viewmode-overview>`;
          break;
        default:
          currentViewmodeElement = html`<dote-viewmode-overview></dote-viewmode-overview>`;
      }
    
    return html`
      <nav>
        <ul class="dote-viewmode-selector-list">
          ${this._viewmodeList
              // render out list of available modes w/separator chars between them
              .map((viewmode, index) => {
              return html`
                <li @click="${this._switchCurrentViewmode}" class=${viewmode.displayName === this.currentViewmode ? "dote-selected-viewmode" : "dote-not-selected-viewmode"} data-viewmode=${viewmode.displayName}>
                    ${viewmode.displayName}
                </li>
                ${index !== this._viewmodeList.length - 1 ? " | " : ""}
                `
            })
          }
        </ul>
      </nav>
      <hr>
      <section class="dote-viewmode-container">
        ${currentViewmodeElement}
      </section>
    `
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
}

customElements.define('dote-viewmode-selector', DoteViewmodeSelector);
