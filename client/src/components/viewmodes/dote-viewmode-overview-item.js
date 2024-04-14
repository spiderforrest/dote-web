import {LitElement, css, html} from 'lit';

export class DoteViewmodeOverviewItem extends LitElement {
  static properties = {
    showBody: {},
    itemData: {}
  };

  render() {
    return html`
      <section class="dote-overview-itemcard">
        <span>(itemtitle) | </span>
        <span>(itemtype)</span>
        <span>(bodytoggle)</span>
        <span>(item create/update date)</span>
      </section>
    `;
  }
}

customElements.define('dote-viewmode-overview-item', DoteViewmodeOverviewItem);
