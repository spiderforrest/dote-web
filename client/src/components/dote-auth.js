import {LitElement, css, html} from 'lit';

export class DoteAuth extends LitElement {


  render() {
    return html`
      <form id="user-login-form" @submit="${this._submitLogin}">
        <label for="username-input">username: </label>
        <input id="username-entry" name="username-input" type="text" required />
        <label for="password-input">password: </label>
        <input id="password-entry" name="password-input" type="password" required />
        <button id="login-button" @click="${this._submitLogin}" type="submit">login</button>
      </form>
      <p id="login-error-message"></p>
    `;
  }

  _submitLogin(e) {
    // prevent page refresh
    e.preventDefault();
    
    // auth with server
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.renderRoot.querySelector('#username-entry').value,
        password: this.renderRoot.querySelector('#password-entry').value
      })
      // if success, package data returned from server and dispatch it up to dote-client-root
    }).then((res) => res.json()).then((res) => {
      if (res.username !== undefined || res.userUuid !== undefined) {
        const serverData = {username: res.username, userUuid: res.uuid};
        const options = {
          detail: serverData,
          bubbles: true,
          composed: true
        };
        this.dispatchEvent(new CustomEvent('userLogin', options));
      }
    });
  }
}

customElements.define('dote-auth', DoteAuth);
