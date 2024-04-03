import {LitElement, css, html} from 'lit';

export class DoteSidebarMenu extends LitElement {

  static properties = {
    // whether the sidebar menu is open or not
    _menuOpen: {state: true},

  };

  constructor() {
    super();
    // menu defaults to closed on initial load
    this._menuOpen = false;
  }

  render() {
    if (this._menuOpen === true) {
      return html` <nav>
        <button @click="${this._toggleMenuOpen}">close menu</button>
        <ul>
          <p>none of these work rn btw</p>
          <li><a>Settings</a></li>
          <li><a>About</a></li>
          <li><a>Help</a></li>
        </ul>
        <nav />
      </nav>`;
    } else {
      return html` <button @click="${this._toggleMenuOpen}">booten</button>
        <h1>${this.providedData}</h1>`;
    }
  }

  _toggleMenuOpen(e) {
    this._menuOpen = !this._menuOpen;
  }
}

customElements.define('dote-sidebar-menu', DoteSidebarMenu);
