import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column.js';
import '@vaadin/vaadin-grid/vaadin-grid-filter.js';
import '@vaadin/vaadin-button/vaadin-button.js';
import '@vaadin/vaadin-checkbox/vaadin-checkbox.js';
import '@polymer/paper-dialog/paper-dialog.js';

class MyView3 extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
          padding: 10px;
        }
        .text-input {
          border: none;
        }
      </style>

      <vaadin-button theme="primary" on-click="_addMember">Add Member</vaadin-button>
      <vaadin-button theme="primary" on-click="_saveChanges">Save Changes</vaadin-button>
      <vaadin-button theme="primary" on-click="_openTransaction">Create Transaction</vaadin-button>
      <vaadin-grid id="grid" items="{{shownMembers}}" height-by-rows>

        <vaadin-grid-selection-column auto-select>
        </vaadin-grid-selection-column>

        <vaadin-grid-column>
          <template class="header">Name</template>
          <template>
            <input class="text-input" value="{{item.name::input}}" readonly$="[[!_isNew(item)]]" on-click="[[_rowEdited(item)]]">
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">Email</template>
          <template>
            <input class="text-input" value="{{item.email::input}}" readonly$="[[!editMode]]" on-click="[[_rowEdited(item)]]">
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">Phone</template>
          <template>
            <input class="text-input" value="{{item.phone::input}}" readonly$="[[!editMode]]">
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">Active</template>
          <template>
            <vaadin-checkbox checked="{{item.active}}" disabled="[[!editMode]]"></vaadin-checkbox>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">Balance</template>
          <template>
            <input class="text-input" value="{{item.balance::input}}" readonly$="[[!_isNew(item)]]">
          </template>
        </vaadin-grid-column>

      </vaadin-grid>

      <paper-dialog id="transaction">
        <h2>Dialog Title</h2>
        <paper-dropdown-menu label="Value">
          <paper-listbox class="dropdown-content" slot="dropdown-content">
            <paper-item>Charge Invoice</paper-item>
            <paper-item>Record Payment</paper-item>
          </paper-listbox>
        </paper-dropdown-menu>
      </paper-dialog>

      <div class="card">
        <h1>Manage Members</h1>
        <p>TODO: connect phone tree and show member details (import from phone tree, export to phone tree). allow adding to phone tree and adding from phone tree to the app database. move members from active to inactive (keep values in DB for if they get moved again). add purge functionality</p>
      </div>
    `;
  }

  static get properties () {
    return {
      members: {
        type: Array,
        value: []
      },
      activeMembers: {
        type: Array
      },
      shownMembers: {
        type: Array
      },
      editMode:{
        type: Boolean,
        value: true
      }
    };
  }

  ready(){
    super.ready();
    var self = this;
    self._getMembers();
  }

  _getMembers() {
    var self = this;
    firestore.collection("members").get().then((querySnapshot) => {
      querySnapshot.forEach((memberDoc) => {
        console.log("got members", memberDoc.data())
        self.push("members", memberDoc.data());
      });
      var activeMembers = [];
      self.members.forEach((user) => {
        if (user.active) {
          activeMembers.push(user);
        }
      });
      self.set("activeMembers",  activeMembers);
      self.set("shownMembers", _.cloneDeep(self.activeMembers));
    });
  }

  _addMember() {
    var self = this;
    self.push('shownMembers', {"active": true, "balance": 0});
  }

  _isNew(item) {
    var self = this;
    if (_.find(self.members, {"name":item.name}) == undefined) {
      return true;
    }
    return false;
  }

  _rowEdited(item) {
    var self = this;
    if (_.find(self.members, item) == undefined && self.$.grid.selectedItems.indexOf(item) < 0) {
      self.$.grid.selectedItems.push(item);
    }
  }

  _saveChanges() {
    var self = this;
    if (self.$.grid.selectedItems.length == 0) {
      alert("No rows selected for save");
    } else {
      self.$.grid.selectedItems.forEach((member) => {
        if (_.find(self.members, member) == undefined) {
          console.log("adding to db", member);
           firestore.collection("members").doc(member.name).set(member).catch(function(error) {
            console.error("Error updating document: ", error);
            self.$.alertText.innerHtml = "Error saving, see log";
            self.$.alert.open();
          });;
        } else {
          console.log("already exists", member);
        }
      });
    }
  }

  _openTransaction() {
    var self = this;
    self.$.transaction.open();
  }

  _createTransaction() {
    var self = this;
    if (self.$.grid.selectedItems.length == 0) {
      alert("No rows selected for save");
    } else {
      self.$.grid.selectedItems.forEach((member) => {

      });
    }
  }

}

window.customElements.define('my-view3', MyView3);
