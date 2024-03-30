import {LitElement, css, html} from 'lit';
import {map} from 'lit/directives/map.js';

import {DoteViewmodeDebug} from './viewmodes/dote-viewmode-debug.js';

export class DoteViewmodeSelector extends LitElement {
  static properties = {
    currentViewmode: {type: String},
    _viewmodeList: {state: true},
    _viewmodeDisplayNameList: {state: true}
  };

  constructor() {
    super();
    // load all available viewmodes, store list of display names
    // TODO: implement setting for choosing what viewmodes display and which is default
    // for now, doing it manually
    this._viewmodeList = [
      { displayName: "DEBUG" },
      { displayName: "OVERVIEW" }
    ]

    // set to default viewmode
    this.currentViewmode = "viewmode_debug";
  }
  
  render() {
    // print names 
    return html`
      <nav>
        <ul>
          ${this._viewmodeList
              .map((viewmode, index) => {
              return html`
                <li @click="${this._switchCurrentViewmode}" style="display:inline" data-viewmode=${viewmode.displayName}>
                    ${viewmode.displayName}
                </li>
                ${index !== this._viewmodeList.length - 1 ? " | " : ""}
                `
            })
          }
        </ul>
      </nav>
    `
  }

  _switchCurrentViewmode(e) {
    console.log(e.target.dataset.viewmode);
  }
}

customElements.define('dote-viewmode-selector', DoteViewmodeSelector);
