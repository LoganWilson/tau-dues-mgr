
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';

class BudgetView extends PolymerElement {
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

      <vaadin-dropdown-menu id="budgetHistoryMenu" label="Budget" on-value-changed="_budgetValueChanged">
        <template>
          <vaadin-list-box>
            <template is="dom-repeat" items="[[budgets]]" as="budget">
              <vaadin-item>[[budget.date]]</vaadin-item>
            </template>
          </vaadin-list-box>
        </template>
      </vaadin-dropdown-menu>
      <vaadin-button theme="primary" on-click="_saveChanges">Save</vaadin-button>
      <vaadin-button theme="secondary" on-click="_newBudget">New Budget</vaadin-button>

      <div class="card" id="totalExpectedCard">
        <vaadin-text-field id="totalReceivables" value="{{receivables.total}}" label="Total Expected Receivables" type="number" readonly></vaadin-text-field>
        <vaadin-text-field id="expenseTotal" label="Total Expected Expenses" type="number" readonly></vaadin-text-field>
        <vaadin-text-field id="expectedBalance" label="Expected Remaining Balance" type="number" readonly></vaadin-text-field>
      </div>

      <!--<div class="card" id="totalActualCard">
        <vaadin-text-field id="totalReceived" label="Total Received" type="number" readonly></vaadin-text-field>
        <vaadin-text-field id="totalPaid" label="Total Paid" type="number" readonly></vaadin-text-field>
        <vaadin-text-field id="balance" label="Balance" type="number" readonly></vaadin-text-field>
      </div>-->

      <div class="card" id="receivablesCard">
        <vaadin-text-field id="actives" value="{{receivables.actives}}" label="Actives" type="number" readonly on-change="_receivablesEdited"></vaadin-text-field>
        <vaadin-text-field id="activeDues" value="{{receivables.activeDues}}" label="Active Dues" type="number" on-change="_receivablesEdited"></vaadin-text-field>
        <vaadin-text-field id="actives" value="{{receivables.associates}}" label="Associates" type="number" on-change="_receivablesEdited"></vaadin-text-field>
        <vaadin-text-field id="associateDues" value="{{receivables.associateDues}}" label="Associate Dues" type="number" on-change="_receivablesEdited"></vaadin-text-field>
        <vaadin-text-field id="rollover" value="{{receivables.rollover}}" label="Checking Account Roll-over" type="number" on-change="_receivablesEdited"></vaadin-text-field>
        <vaadin-text-field id="donations" value="{{receivables.donations}}" label="Donations" type="number" on-change="_receivablesEdited"></vaadin-text-field>
        <vaadin-text-field id="other" value="{{receivables.other}}" label="Other Receivables" type="number" on-change="_receivablesEdited"></vaadin-text-field>
        <!--<vaadin-text-area style="max-height: 100px;" label="Receivables Notes" value={{receivables.notes}}></vaadin-text-area>-->
      </div>

      <div class="card" id="expensesCard">
        <vaadin-button theme="primary" on-click="_addBudgetItem">Add Expense</vaadin-button>
        <!--<vaadin-checkbox checked="{{showExpenseHistory}}">Show Past Budget Items</vaadin-checkbox>
        <template is="dom-if" if={{showExpenseHistory}}>
        </template>-->

        <vaadin-grid id="expenseGrid" items="{{expenseItems}}" height-by-rows on-active-item-changed="_showRowDetails">

          <template class="row-details">
            <div class="details row" >
              <vaadin-item>
                <vaadin-text-area style="max-height: 100px;" label="Expense notes" value={{item.notes}}></vaadin-text-area>
              </vaadin-item>
              <vaadin-item>
                <div><vaadin-button theme="primary" on-click="_recordPayment">Record Payment</vaadin-button></div>
                <div><vaadin-button theme="primary" on-click="_deleteExpense">Delete Expense</vaadin-button></div>
              </vaadin-item>

              <template is="dom-repeat" items="[[item.payments]]" as="payment">
                <vaadin-item>
                  <div><vaadin-text-field on-change="[[_rowEdited(item)]]" value="{{payment.amount::input}}" type="number" prevent-invalid-input pattern="[0-9]*" label="Paid Amount"></vaadin-text-field></div>
                  <div><small>Paid Date: [[payment.date]]</small></div>
                </vaadin-item>
              </template>

            </div>
          </template>

          <vaadin-grid-column>
            <template class="header">Expense</template>
            <template>
              <template is="dom-if" if="[[!_isNew(item)]]">[[item.expense]]</template>
              <template is="dom-if" if="[[_isNew(item)]]">
                <vaadin-text-field value="{{item.expense}}"></vaadin-text-field>
              </template>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column>
            <template class="header">Expense Group</template>
            <template>
              <vaadin-dropdown-menu value="{{item.expenseGroup}}" on-value-changed="_expenseGroupChanged">
                <template>
                  <vaadin-list-box>
                      <vaadin-item>None</vaadin-item>
                      <vaadin-item>Active</vaadin-item>
                      <vaadin-item>Associate</vaadin-item>
                      <vaadin-item>Active and Associate</vaadin-item>
                  </vaadin-list-box>
                </template>
              </vaadin-dropdown-menu>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column>
            <template class="header">Number of payments</template>
              <template>
                <template is="dom-if" if="[[!_isNormal(item)]]">
                  <vaadin-text-field value="{{item.numberOfPayments::input}}" type="number" readonly></vaadin-text-field>
                </template>
                <template is="dom-if" if="[[_isNormal(item)]]">
                  <vaadin-text-field on-change="[[_rowEdited(item)]]" value="{{item.numberOfPayments::input}}" type="number" prevent-invalid-input pattern="[0-9]*" required></vaadin-text-field>
                </template>
              </template>
          </vaadin-grid-column>

          <vaadin-grid-column>
            <template class="header">Amount</template>
            <template>
              <vaadin-text-field on-change="[[_rowEdited(item)]]" value="{{item.amount::input}}" type="number" prevent-invalid-input pattern="[0-9]*" required></vaadin-text-field>
            </template>
          </vaadin-grid-column>

          <vaadin-grid-column>
            <template class="header">Total</template>
            <template>
              <vaadin-text-field value="{{item.total::input}}" type="number" readonly></vaadin-text-field>
            </template>
          </vaadin-grid-column>

          <!--<vaadin-grid-column hidden=[[!showExpenseHistory]]>
            <template class="header">Current Expense</template>
            <template>
              <vaadin-checkbox checked="{{item.current}}"></vaadin-checkbox>
            </template>
          </vaadin-grid-column>-->

        </vaadin-grid>

      </div>

      <paper-dialog id="alert">
        <div style="display:inline-block">
          <h4 id="alertText"></h4>
          <vaadin-button theme="secondary" on-click="_toggleAlert">Close</vaadin-button>
        </div>
      </paper-dialog>

    `;
  }

  static get properties () {
    return {
      budgets: { type: Array },
      // showExpenseHistory: {
      //   type: Boolean,
      //   value: false,
      //   observer: "_toggleExpenseHistory"
      // },
      selectedBudget: { type: Object },
      expenseItems: { type: Array },
      receivables: { type: Object },
    };
  }

  ready(){
    super.ready();
    var self = this;
    self._getBudgets();
  }

  _deleteExpense(e) {
    var self = this;
    var expenseItems = _.cloneDeep(self.expenseItems);
    var expenseItem = _.remove(expenseItems, e.model.item);
    console.log("expense items", expenseItems);
    self.set("expenseItems", expenseItems);
  }

  _recordPayment(e) {
    var self = this;
    var expenseItems = _.cloneDeep(self.expenseItems);
    var expenseItem = _.find(expenseItems, e.model.item);

    var payment = {};
    payment.amount = expenseItem.amount;
    var today = new Date();
    today = today.getMonth()+1 + '/' + today.getDate() + '/' + today.getFullYear();
    payment.date = today;
    if (expenseItem.payments == undefined) expenseItem.payments = [];
    expenseItem.payments.forEach((p) => {
      if (payment.amount - p.amount >= 0) payment.amount -= p.amount;
      else payment.amount = 0;
    });
    expenseItem.payments.push(payment);
    self.set("expenseItems", expenseItems);
    var row = {detail: {value: e.model.item}};
    self._showRowDetails(row);
  }

  _showRowDetails(e) {
    var self = this;
    self.$.expenseGrid.detailsOpenedItems = [e.detail.value];
  }

  _budgetValueChanged(e) {
    var self = this;
    if (self.selectedBudget != undefined && self.selectedBudget.date != e.detail.value) {
      self._selectedBudgetChanged(e.detail.value);
    }
  }

  _expenseGroupChanged(e) {
    var self = this;
    var expenseGroup = e.detail.value;
    var expenseItem = _.find(self.expenseItems, e.model.item);
    if (expenseItem != undefined) {
      switch(expenseGroup) {
        case "Active":
          expenseItem.numberOfPayments = self.receivables.actives;
          break;
        case "Associate":
          expenseItem.numberOfPayments = self.receivables.associates;
          break;
        case "Active and Associate":
          expenseItem.numberOfPayments = self.receivables.actives + self.receivables.associates;
          break;
      }
    }
  }

  _rowEdited(item) {
    var self = this;
    var expenseItem = _.find(self.expenseItems, item);
    if (expenseItem != undefined) {
      expenseItem.total = expenseItem.numberOfPayments * expenseItem.amount;
    }
    var total = 0;
    self.expenseItems.forEach((expenseItem) => {
      total += expenseItem.total;
    });
    self.$.expenseTotal.value = total;
    self.$.expectedBalance.value = self.receivables.total - total;
  }

  _receivablesEdited(e) {
    var self = this;
    if (self.receivables != undefined) {
      var r = _.cloneDeep(self.receivables);
      function fixNumber(receivable) {
        if (receivable == undefined || Number(receivable) == "NaN") return 0;
        else return Number(receivable);
      }
      r.activeDues = fixNumber(r.activeDues);
      r.actives = fixNumber(r.actives);
      r.associates = fixNumber(r.associates);
      r.associateDues = fixNumber(r.associateDues);
      r.rollover = fixNumber(r.rollover);
      r.other = fixNumber(r.other);
      r.donations = fixNumber(r.donations);
      r.total = (r.activeDues * r.actives) + (r.associates * r.associateDues) + r.rollover + r.donations + r.other;
      self.set("receivables", r);
      self.$.expectedBalance.value = r.total - self.$.expenseTotal.value;
    }
  }

  _isNormal(item) {
    var self = this;
    if (item.expenseGroup == "None") {
      return true;
    } else return false;
  }

  _getBudgets() {
    var self = this;
    self.budgets = [];
    firestore.collection("budgets").get().then((querySnapshot) => {
      querySnapshot.forEach((budgetDoc) => {
        var budget = {};
        budget = budgetDoc.data();
        self.push("budgets", budget);
        if (budget.isCurrent) {
          self._selectedBudgetChanged(budget.date)
        }
      });
    });
  }

  _selectedBudgetChanged(date) {
    var self = this;
    var selectedBudget = _.find(self.budgets, {"date":date});
    if (selectedBudget != undefined) {
      if (selectedBudget.expenseItems == undefined) selectedBudget.expenseItems = [];
      if (selectedBudget.receivables == undefined) selectedBudget.receivables = {};

      var actives = 0;
      firestore.collection("members").get().then((querySnapshot) => {
        querySnapshot.forEach((memberDoc) => {
          var member = {};
          member = memberDoc.data();
          if (member.active) actives++;
        });
        selectedBudget.receivables.actives = actives;

        self.set("receivables", selectedBudget.receivables);

        // update number of payments if there's an expense group
        selectedBudget.expenseItems.forEach(expenseItem => {
          switch(expenseItem.expenseGroup) {
            case "Active":
              expenseItem.numberOfPayments = self.receivables.actives;
              break;
            case "Associate":
              expenseItem.numberOfPayments = self.receivables.associates;
              break;
            case "Active and Associate":
              expenseItem.numberOfPayments = self.receivables.actives + self.receivables.associates;
              break;
          }
        })
        self.set("expenseItems", selectedBudget.expenseItems);

        self.set("selectedBudget", selectedBudget);
        if (self.selectedBudget != undefined) {
          self.$.budgetHistoryMenu.value = self.selectedBudget.date;
        } else console.error("selected budget undefined");
      });


    }

  }

  _newBudget() {
    var self = this;
    // set current budget to not current
    var currentBudget = _.find(self.budgets, {"isCurrent":true});
    var newBudget = _.cloneDeep(currentBudget);
    currentBudget.isCurrent = false;
    self._saveBudget(currentBudget);
    newBudget.timestamp = Date.now();
    var today = new Date();
    today = today.getMonth()+1 + '/' + today.getDate() + '/' + today.getFullYear();
    newBudget.date = today;
    self._saveBudget(newBudget);
  }

  _saveChanges() {
    var self = this;
    self.selectedBudget.expenseItems = self.expenseItems;
    self.selectedBudget.receivables = self.receivables;
    self._saveBudget(self.selectedBudget);
  }

  _saveBudget(budget) {
    var self = this;

    var index = _.findIndex(self.budgets, (b) => b.timestamp == budget.timestamp);
    if (index == -1) {
      self.push("budgets", budget);
      self._selectedBudgetChanged(budget.date)
    } else {
      self.budgets.splice(index, 1);
      self.budgets.splice(index, 0, budget);
      var budgetsCopy = _.cloneDeep(self.budgets);
      self.set("budgets", budgetsCopy);
    }

    var err = false;
    var docKey = budget.timestamp + "";
    firestore.collection("budgets")
    .doc(docKey)
    .set(budget)
    .then(function() {})
    .catch(function(error) {
      console.error("Error updating budget document: ", error);
      if (!err) {
        self._toggleAlert("Error with database");
        err = true;
      }
    });
    if (!err) {
      self._toggleAlert("Save successful")
    }
  }

  _isNew(item) {
    return true;
  }

  // _toggleExpenseHistory() {
  //   var self = this;
  //   if (self.showExpenseHistory) {
  //
  //   }
  // }

  _addBudgetItem() {
    var self = this;
    self.push("expenseItems",{"expenseGroup": "None", "numberOfPayments": 1, "amount": 0});
  }

  _deleteBudgetExpenseHistory() {

  }

  _toggleAlert(text) {
    var self = this;
    self.$.alertText.textContent = text;
    self.$.alert.toggle();
  }

}
window.customElements.define('budget-view', BudgetView);
