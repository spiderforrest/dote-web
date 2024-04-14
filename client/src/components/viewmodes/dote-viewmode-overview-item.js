import {LitElement, css, html} from 'lit';

export class DoteViewmodeOverviewItem extends LitElement {
  static properties = {
    showBody: {},
    itemData: {}
  };

  constructor() {
    super();
    this.showBody = false;
    this.itemData = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    // once item data can be read from attribute, do so
    console.log("from itemcard: ", this.itemData);
  }

  render() {
    return html`
      <section class="dote-overview-itemcard">
      <span>${this.itemData.title} | </span>
      <span>${this.itemData.type} | </span>
      <span>(bodytoggle) | </span>
      <span><em>created: ${new Date(this.itemData.created).toString()}</em></span>
      </section>
      `;
  }
}

customElements.define('dote-viewmode-overview-item', DoteViewmodeOverviewItem);
