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
      <section>
        <p>${this.rawJSONUserData}</p>
        <p>test</p>
      </section>
    `
  }
}

customElements.define('dote-viewmode-debug', DoteViewmodeDebug);
