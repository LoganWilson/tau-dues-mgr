import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column.js';
import '@vaadin/vaadin-grid/vaadin-grid-filter.js';
import '@vaadin/vaadin-button/vaadin-button.js';
import '@vaadin/vaadin-checkbox/vaadin-checkbox.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@vaadin/vaadin-dropdown-menu/vaadin-dropdown-menu'
import '@vaadin/vaadin-text-field/vaadin-text-field'
import '@vaadin/vaadin-form-layout/vaadin-form-layout'

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
        .details {
          display: flex;
          font-size: 20px;
        }
      </style>

      <vaadin-button theme="primary" on-click="_addMember">Add Member</vaadin-button>
      <vaadin-button theme="primary" on-click="_saveChanges">Save Changes</vaadin-button>
      <vaadin-button theme="primary" on-click="_toggleTransaction">Create Transaction</vaadin-button>
      <vaadin-checkbox checked="{{showDetails}}">All Details</vaadin-checkbox>

      <vaadin-grid id="grid" items="{{shownMembers}}" height-by-rows on-active-item-changed="_showRowDetails">

        <template class="row-details">
          <div class="details" >
            <vaadin-item>
              <div><strong>Amount:</strong></div>
              <div><small><strong>Date:</strong></small></div>
            </vaadin-item>
            <template is="dom-repeat" items="[[item.transactions]]" as="transaction">
              <vaadin-item>
                <div>$&nbsp;[[transaction.amount]]</div>
                <div><small>[[transaction.date]]</small></div>
              </vaadin-item>
            </template>
          </div>
        </template>

        <vaadin-grid-selection-column></vaadin-grid-selection-column>

        <vaadin-grid-column>
          <template class="header">Name</template>
          <template>
            <template is="dom-if" if="[[!_isNew(item)]]">[[item.name]]</template>
            <template is="dom-if" if="[[_isNew(item)]]">
              <vaadin-text-field class="text-" value="{{item.name::input}}" on-click="[[_rowEdited(item)]]"></vaadin-text-field>
            </template>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column hidden=[[!showDetails]]>
          <template class="header">Email</template>
          <template>
            <vaadin-text-field class="text-input" value="{{item.email::input}}" on-click="[[_rowEdited(item)]]"></vaadin-text-field>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column hidden=[[!showDetails]]>
          <template class="header">Phone</template>
          <template>
            <vaadin-text-field class="text-input" value="{{item.phone::input}}" on-click="[[_rowEdited(item)]]"></vaadin-text-field>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column hidden=[[!showDetails]]>
          <template class="header">Active</template>
          <template>
            <vaadin-checkbox checked="{{item.active}}" on-click="[[_rowEdited(item)]]"></vaadin-checkbox></vaadin-text-field>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">Balance</template>
          <template>
            <vaadin-text-field class="text-input" value="{{item.balance::input}}" type="number" on-click="[[_rowEdited(item)]]"></vaadin-text-field>
          </template>
        </vaadin-grid-column>

      </vaadin-grid>

      <paper-dialog id="transaction">
        <vaadin-form-layout>
          <vaadin-form-item>
            <vaadin-dropdown-menu id="transactionType" label="Transaction Type" value="Bill Amount">
              <template>
                <vaadin-list-box>
                  <vaadin-item>Bill Amount</vaadin-item>
                  <vaadin-item>Record Payment</vaadin-item>
                </vaadin-list-box>
              </template>
            </vaadin-dropdown-menu>
          </vaadin-form-item>
          <vaadin-form-item>
            <vaadin-text-field id="transactionAmount" label="Amount $" placeholder="0.00"></vaadin-text-field>
          </vaadin-form-item>
          <vaadin-form-item>
            <vaadin-text-field id="transactionMemo" label="Memo"></vaadin-text-field>
          </vaadin-form-item>
          <vaadin-form-item>
            <vaadin-button theme="secondary" on-click="_toggleTransaction">Cancel</vaadin-button>
            <vaadin-button theme="primary" on-click="_createTransaction">Confirm</vaadin-button>
          </vaadin-form-item>
        <vaadin-form-layout>
      </paper-dialog>

      <paper-dialog id="alert">
        <div style="display:inline-block">
          <h4 id="alertText"></h4>
          <vaadin-button theme="secondary" on-click="_toggleAlert">Close</vaadin-button>
        </div>
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
      showDetails: {
        type: Boolean,
        value: false,
        observer: '_showMembers'
      }
    };
  }

  ready(){
    super.ready();
    var self = this;
    self._getMembers();
  }

  _showRowDetails(e) {
    var self = this;
    self.$.grid.detailsOpenedItems = [e.detail.value];
  }

  _getMembers() {
    var self = this;
    firestore.collection("members").get().then((querySnapshot) => {
      querySnapshot.forEach((memberDoc) => {
        console.log("got member", memberDoc.data())
        var member = {};
        member = memberDoc.data();
        if (member.transactions != undefined) {
          member.transactions = member.transactions.sort((a, b) => b.timestamp - a.timestamp);
        }
        console.log("member", member);
        self.push("members", member);
      });
      var activeMembers = [];
      self.members.forEach((member) => {
        if (member.active) {
          activeMembers.push(member);
        }
      });
      self.set("activeMembers",  activeMembers);
      self._showMembers();
    });
  }

  _addMember() {
    var self = this;
    self.push('shownMembers', {"active": true, "balance": 0, "transactions": []});
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

  _showMembers() {
    var self = this;
    if (self.showDetails) {
      self.set("shownMembers", _.cloneDeep(self.members));
    } else {
      self.set("shownMembers", _.cloneDeep(self.activeMembers));
    }
  }

  _saveChanges() {
    var self = this;
    if (self.$.grid.selectedItems.length == 0) {
      self._toggleAlert("No members selected to save");
    } else {
      self.$.grid.selectedItems.forEach((member) => {

        // if there is a change in the object
        if (_.find(self.members, member) == undefined) {
          // get the original member object
          var origMemberSingleton = _.remove(self.members, {"name": member.name});
          var origMember = origMemberSingleton[0];

          if (origMember != undefined && origMember.balance != member.balance) {
            // then create a transaction
            var today = new Date();
            today = today.getMonth()+1 + '/' + today.getDate() + '/' + today.getFullYear();
            var amount = member.balance - origMember.balance;
            var timestamp = Date.now();
            var transaction = {
              'date': today,
              'amount': amount,
              'timestamp': timestamp
            };
            if (member.transactions == undefined) member.transactions = [];
            member.transactions.push(transaction);
          }

          firestore.collection("members").doc(member.name).set(member)
          .then(function() {
            self._toggleAlert("Changes saved successfully");
          }).catch(function(error) {
            console.error("Error updating member document: ", error);
            self._toggleAlert("Error with database");
          });
          self.push("members", _.cloneDeep(member));

        } else {
          console.log("already exists", member);
        }
      });
    }
  }

  _toggleTransaction() {
    var self = this;
    if (self.$.grid.selectedItems.length == 0) {
      self._toggleAlert("No members selected to create transaction on");
    } else {
      self.$.transaction.toggle();
    }
  }

  _toggleAlert(text) {
    var self = this;
    self.$.alertText.textContent = text;
    self.$.alert.toggle();
  }

  _createTransaction() {
    var self = this;
    var type = self.$.transactionType.value;
    var amount = Number(self.$.transactionAmount.value);
    var memo = self.$.transactionMemo.value;
    if (amount > 0) {

      if (type == "Bill Amount") {
        self.$.grid.selectedItems.forEach((member) => {
          member.balance = member.balance - amount;
        });
      } else if (type == "Record Payment") {
        self.$.grid.selectedItems.forEach((member) => {
          member.balance = member.balance + amount;
        });
      } else console.log("transaction type is fucked up...")
      self._saveChanges();
    } else {
      self._toggleAlert("The amount must be a rational number greater than zero");
    }

  }

}

window.customElements.define('my-view3', MyView3);
