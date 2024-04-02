import {LitElement, css, html} from 'lit';

export class DoteViewmodeDebug extends LitElement {
  static properties = {
    rawJSONUserData: {type: String},
  };

  constructor() {
    super();
  }

  render() {
    return html`
      <section>
        <p class="dote-viewmode-debug">${this.rawJSONUserData}</p>
      </section>
    `;
  }

  // styling =================================

  static styles = css`
    p {
      border: thin double teal;
    }
  `;
}

customElements.define('dote-viewmode-debug', DoteViewmodeDebug);
