import {LitElement, css, html} from 'lit';
import {ContextConsumer} from '@lit/context';

import {userContextKey} from './context/dote-context-objects.js';

export class DoteAuth extends LitElement {
  _userDataConsumer = new ContextConsumer(this, {context: userContextKey});


  render() {
    // _userDataConsumer.value = "swears";
    return html`
      <form id="user-login-form" @submit="${this._submitLogin}">
        <label for="username-input">username: </label>
        <input id="username-entry" name="username-input" type="text"></input>
        <label for="password-input">password: </label>
        <input id="password-entry" name="password-input" type="password"></input>
        <button id="login-button" @click="${this._submitLogin}" type="submit">login</button>
      </form>
    `;
  }

  _submitLogin(e) {
    // prevent page refresh
    e.preventDefault();

    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.renderRoot.querySelector('#username-entry').value,
        password: this.renderRoot.querySelector('#password-entry').value
      })
    }).then((res) => res.json()).then((res) => {
      this._userDataConsumer.value = {username: res.username, userUuid: res.uuid};
      console.log(this._userDataConsumer.value.username);
    });
  }
}

customElements.define('dote-auth', DoteAuth);
