import {LitElement, css, html} from 'lit';

export class DoteViewmodeDebug extends LitElement {
  static properties = {
    rawJSONUserData: {type: String}
  };

  constructor() {
    super();
  }

  render() {
    return html`
      <p>${this.rawJSONUserData}</p>
      <p>test</p>
    `
  }
}

customElements.define('dote-viewmode-debug', DoteViewmodeDebug);
