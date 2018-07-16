
const PAYPAL_ME = "https://www.paypal.me/LCAPhiPhi/"
const SEND_EMAIL_PHP = 'https://www.csl.mtu.edu/classes/cs4760/www/projects/s18/group2/www/.logan/tau-dues-mgr/sendEmail.php';
const SEND_MSG_PHP = 'https://www.csl.mtu.edu/classes/cs4760/www/projects/s18/group2/www/.logan/tau-dues-mgr/sendMessage.php'
const TEXT_LOCAL_API_KEY = '65IcCitBteg-P3v00H3Lv541tWrIxTEeubsWMROnV8';

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
import '@polymer/iron-flex-layout/iron-flex-layout.js'

class MembersView extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
          padding: 10px;
        }
        .details {
          display: flex;
          font-size: 20px;
        }
        .column {
          @apply --layout-vertical;
        }
        .row {
          @apply --layout-horizontal;
        }
      </style>

      <vaadin-button theme="primary" on-click="_addMember">Add Member</vaadin-button>
      <vaadin-button theme="primary" on-click="_saveChanges">Save Changes</vaadin-button>
      <vaadin-button theme="primary" on-click="_toggleTransaction">Create Transaction</vaadin-button>
      <vaadin-button theme="primary" on-click="_toggleMessage">Send Email/Text</vaadin-button>
      <vaadin-checkbox checked="{{showDetails}}">All Details</vaadin-checkbox>

      <vaadin-grid id="grid" items="{{shownMembers}}" height-by-rows on-active-item-changed="_showRowDetails">

        <template class="row-details">
          <div class="details" >
            <vaadin-item>
              <div><strong>History:</strong></div>
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
            <vaadin-checkbox checked="{{item.active}}" on-click="[[_rowEdited(item)]]"></vaadin-checkbox>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column hidden=[[!showDetails]]>
          <template class="header">Associate</template>
          <template>
            <vaadin-checkbox checked="{{item.associate}}" on-click="[[_rowEdited(item)]]"></vaadin-checkbox>
          </template>
        </vaadin-grid-column>

        <vaadin-grid-column>
          <template class="header">Balance</template>
          <template>
            <vaadin-text-field class="text-input" value="{{item.balance::input}}" type="number" on-click="[[_rowEdited(item)]]"></vaadin-text-field>
          </template>
        </vaadin-grid-column>

      </vaadin-grid>

      <paper-dialog id="transaction" class="column">
        <vaadin-dropdown-menu id="transactionType" label="Transaction Type" value="Record Payment">
          <template>
            <vaadin-list-box>
              <vaadin-item>Record Payment</vaadin-item>
              <vaadin-item>Bill Amount</vaadin-item>
            </vaadin-list-box>
          </template>
        </vaadin-dropdown-menu>
        <vaadin-text-field id="transactionAmount" label="Amount $" placeholder="0.00"></vaadin-text-field>
        <vaadin-text-field id="transactionMemo" label="Memo"></vaadin-text-field>
        <vaadin-button theme="secondary" on-click="_toggleTransaction">Cancel</vaadin-button>
        <vaadin-button theme="primary" on-click="_createTransaction">Confirm</vaadin-button>
      </paper-dialog>

      <paper-dialog id="message" class="column">
        <vaadin-dropdown-menu id="messageType" label="Message Type" value="Email and Text">
          <template>
            <vaadin-list-box>
              <vaadin-item>Email and Text</vaadin-item>
              <vaadin-item>Email</vaadin-item>
              <vaadin-item>Text</vaadin-item>
            </vaadin-list-box>
          </template>
        </vaadin-dropdown-menu>
        <vaadin-text-field id="messageSubject" label="Message Subject" value="LCA Dues"></vaadin-text-field>
        <vaadin-text-field id="replyEmail" label="Your Email (sent from)" value="LCATau@mtu.edu"></vaadin-text-field>
        <vaadin-text-field id="additionalMessageContent" label="Additional Message Content" value=""></vaadin-text-field>
        <vaadin-checkbox id="includePaymentHistory">Include payment history</vaadin-checkbox>
        <vaadin-button theme="secondary" on-click="_toggleMessage">Cancel</vaadin-button>
        <vaadin-button theme="primary" on-click="_sendMessages">Send</vaadin-button>
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
        // console.log("got member", memberDoc.data())
        var member = {};
        member = memberDoc.data();
        // console.log("member", member);
        self.push("members", member);
      });
      self._showMembers();
    });
  }

  _addMember() {
    var self = this;
    self.push('shownMembers', {"active": true, "associate": true, "balance": 0, "transactions": []});
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
    var activeMembers = [];
    self.members.forEach((member) => {
      if (member.transactions != undefined) {
        member.transactions = member.transactions.sort((a, b) => b.timestamp - a.timestamp);
      }
      if (member.active) {
        activeMembers.push(member);
      }
    });
    self.set("activeMembers",  activeMembers);
    if (self.showDetails) {
      self.set("shownMembers", _.cloneDeep(self.members));
    } else {
      self.set("shownMembers", _.cloneDeep(self.activeMembers));
    }
    // console.log(self.members, self.shownMembers, self.activeMembers)
  }

  _saveChanges() {
    var self = this;
    if (self.$.grid.selectedItems.length == 0) {
      self._toggleAlert("No members selected to save");
    } else {
      var err = false;
      self.$.grid.selectedItems.forEach((member) => {
        // if there is a change in the object
        if (_.find(self.members, member) == undefined) {
          // get the original member object
          var mIndex = self.members.findIndex((m) => m.name == member.name);
          var origMember = self.members[mIndex];

          if (origMember != undefined && origMember.balance != member.balance) {
            // then create a transaction
            var today = new Date();
            today = today.getMonth()+1 + '/' + today.getDate() + '/' + today.getFullYear();
            var amount = (member.balance - origMember.balance).toFixed(2);
            var timestamp = Date.now();
            var transaction = {
              'date': today,
              'amount': amount,
              'timestamp': timestamp
            };
            if (member.transactions == undefined) member.transactions = [];
            member.transactions.push(transaction);
            self.members[mIndex] = member;
          } else if (origMember == undefined) {
            // new members
            self.members.push(member);
          }
          // update in the DB
          firestore.collection("members").doc(member.name).set(member)
          .then(function() {
          }).catch(function(error) {
            console.error("Error updating member document: ", error);
            if (!err) {
              self._toggleAlert("Error with database");
              err = true;
            }
          });
        }
      });
      self.set("members", _.cloneDeep(self.members));
      self._showMembers();
      if (!err) {
        self._toggleAlert("Save successful")
      }
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
    self.$.transaction.close();
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
      } else console.error("transaction type is fucked up...")
      self._saveChanges();
    } else {
      self._toggleAlert("The amount must be a rational number greater than zero");
    }
  }

  // _sendEmails() {
  //   var self = this;
  //
  //   console.log("selectedItems", self.$.grid.selectedItems);
  //   self.$.grid.selectedItems.forEach((member) => {
  //     var emailData = {};
  //     emailData.to = member.email;
  //     if (member.balance >= 0) {
  //       emailData.msg = "Your dues are all paid off. Your current balance is $" + member.balance + "\n\n";
  //     } else {
  //       emailData.msg = "You have a total of $" + Math.abs(member.balance) + " pending in payments. (balance of " + member.balance + ")\n\n";
  //     }
  //     if (member.transactions.length > 0) {
  //       emailData.msg += "Recent transaction history:\n" +"Date           Amount\n"
  //     }
  //     for (var i = 0; i < member.transactions.length && i < 6; i++) {
  //       var transaction = member.transactions[i];
  //       if (transaction.amount > 0) {
  //         emailData.msg += transaction.date + "      paid $" + transaction.amount +"\n"
  //       } else {
  //         emailData.msg += transaction.date + "  charged $" + Math.abs(transaction.amount) +"\n"
  //       }
  //     }
  //     emailData.msg += "\nPay using PayPal: " + PAYPAL_ME + Math.abs(member.balance).toFixed(2) + "\n"
  //     console.log("sending", emailData, $("#grid"));
  //
  //     $.ajax({
  //       url: SEND_EMAIL_PHP,
  //       type: 'post',
  //       crossDomain: true,
  //       dataType: 'json',
  //       data: {"email-data" : JSON.stringify(emailData)},
  //       success: function(data) { console.log("php email sent ", data) },
  //       error: function() { console.error("php email not sent") }
  //     });
  //   });
  // }

  _toggleMessage() {
    var self = this;
    if (self.$.grid.selectedItems.length == 0) {
      self._toggleAlert("No members selected to send message to");
    } else {
      self.$.message.toggle();
    }
  }

  _sendMessages() {
    var self = this;
    self.$.message.close();
    var messageType = self.$.messageType.value;
    var messageSubject = self.$.messageSubject.value;
    var replyEmail = self.$.replyEmail.value;
    var additionalMessageContent = self.$.additionalMessageContent.value;
    var includePaymentHistory = self.$.includePaymentHistory.checked;

    self.$.grid.selectedItems.forEach((member) => {

      var msg = "";
      if (additionalMessageContent != "") {
        msg += additionalMessageContent + "\n\n";
      }
      if (member.balance >= 0) {
        msg += "Your dues are all paid off. Your current balance is $" + member.balance + "\n\n";
        emailData.msg += PAYPAL_ME + "\n\n";
      } else {
        msg += "You have a total of $" + Math.abs(member.balance) + " pending in payments. (balance of " + member.balance + ")\n\n";
        msg += "Pay using PayPal: " + PAYPAL_ME + Math.abs(member.balance).toFixed(2) + "\n\n";
      }

      if (messageType == "Email" || messageType == "Email and Text") {
        var emailData = {};
        emailData.to = member.email;
        emailData.from = replyEmail;
        emailData.subject = messageSubject;
        emailData.msg = msg;

        if (includePaymentHistory) {
          if (member.transactions.length > 0) {
            emailData.msg += "Recent transaction history:\n" +"Date           Amount\n"
          }
          for (var i = 0; i < member.transactions.length && i < 6; i++) {
            var transaction = member.transactions[i];
            if (transaction.amount > 0) {
              emailData.msg += transaction.date + "      paid $" + transaction.amount +"\n"
            } else {
              emailData.msg += transaction.date + "  charged $" + Math.abs(transaction.amount) +"\n"
            }
          }
        }

      }
      var textData = {};
      if (messageType == "Text" || messageType == "Email and Text") {
        textData.apiKey = TEXT_LOCAL_API_KEY;
        textData.phone = Number(member.phone.replace(/\D/g, ''));
        textData.msg = msg;
      }

      var data = {"email-data": JSON.stringify(emailData), "text-data": JSON.stringify(textData)};
      $.ajax({
        url: SEND_MSG_PHP,
        type: 'post',
        crossDomain: true,
        dataType: 'json',
        data: data,
        success: function(data) { console.log("sent ", data) },
        error: function() { console.error("not sent") }
      });
    });
  }

}

window.customElements.define('members-view', MembersView);
