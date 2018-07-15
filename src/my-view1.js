
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column.js';
import '@vaadin/vaadin-button/vaadin-button.js';
// import '@polymer/paper-button/paper-button.js';

class MyView1 extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;

          padding: 10px;
        }
      </style>

      <vaadin-button theme="primary">Record Payment</vaadin-button>
      <vaadin-button theme="primary">Charge Dues</vaadin-button>
      <vaadin-button theme="secondary">Email Balance</vaadin-button>
      <vaadin-button theme="secondary">Text Balance</vaadin-button>
      <vaadin-button theme="secondary">Create Payment Plan</vaadin-button>

      <vaadin-grid aria-label="Dynamic Data Example" items="[[activeMembers]]" height-by-rows>

        <vaadin-grid-selection-column auto-select>
        </vaadin-grid-selection-column>

        <vaadin-grid-column>
          <template class="header">Name</template>
          <template>[[item.name]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">Email</template>
          <template>[[item.email]]</template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">Phone</template>
          <template>[[item.phone]]</template>
        </vaadin-grid-column>

      </vaadin-grid>

    `;
  }

  static get properties () {
    return {
      activeMembers: {
        type: Array
      }
    };
  }

  ready(){
    super.ready();
    var self = this;
    document.querySelector('my-app').addEventListener('got-active-members', (e) => {
      console.log("recieved event got-active-members", e.detail);
      self.set("activeMembers", e.detail);
    })
  }

  _add() {
    this.push('items', {firstName: 'First Name ' + this.items.length, lastName: 'Last Name ' + this.items.length});
  }

  _remove() {
    this.pop('items');
  }

}

window.customElements.define('my-view1', MyView1);
