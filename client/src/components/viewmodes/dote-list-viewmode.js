// Generic component for viewmode that renders items in cascading list form.

import { LitElement, css, html } from "lit";
import { ContextConsumer } from "@lit/context";

import { userContextKey } from "../../context/dote-context-objects.js";
import { Items } from "../../../util/Items.js";

export class DoteListViewmode extends LitElement {

}

customElements.define("dote-list-viewmode", DoteListViewmode);
