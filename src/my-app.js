
const LCA_DRIVE_HOME='https://drive.google.com/drive/u/1/folders/0B-6Zm6wARaZ4eW9CMVl0VlgtVDA';
const PAYPAL='https://www.paypal.com/myaccount/summary/'
const FILE_I990='https://file990.org/';

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { setPassiveTouchGestures, setRootPath } from '@polymer/polymer/lib/utils/settings.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column.js';
import '@vaadin/vaadin-grid/vaadin-grid-filter.js';
import '@vaadin/vaadin-button/vaadin-button.js';
import '@vaadin/vaadin-checkbox/vaadin-checkbox.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@vaadin/vaadin-dropdown-menu/vaadin-dropdown-menu'
import '@vaadin/vaadin-text-field/vaadin-text-field'
import '@vaadin/vaadin-text-field/vaadin-text-area.js'
import '@vaadin/vaadin-form-layout/vaadin-form-layout'
import '@polymer/iron-flex-layout/iron-flex-layout.js'
import '@polymer/paper-toggle-button/paper-toggle-button.js'
import './my-icons.js';
import "lodash";

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

// Set Polymer's root path to the same value we passed to our service worker
// in `index.html`.
setRootPath(MyAppGlobals.rootPath);

class MyApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          --app-primary-color: #4285f4;
          --app-secondary-color: black;

          display: block;
        }

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }

        app-header {
          color: #fff;
          background-color: var(--app-primary-color);
        }

        app-header paper-icon-button {
          --paper-icon-button-ink-color: white;
        }

        .drawer-list {
          margin: 0 20px;
        }

        .drawer-list a {
          display: block;
          padding: 0 16px;
          text-decoration: none;
          color: var(--app-secondary-color);
          line-height: 40px;
        }

        .drawer-list a.iron-selected {
          color: black;
          font-weight: bold;
        }
      </style>

      <app-location route="{{route}}" url-space-regex="^[[rootPath]]">
      </app-location>

      <app-route route="{{route}}" pattern="[[rootPath]]:page" data="{{routeData}}" tail="{{subroute}}">
      </app-route>

      <app-drawer-layout fullbleed="" narrow="{{narrow}}">
        <!-- Drawer content -->
        <app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]">
          <app-toolbar>Menu</app-toolbar>
          <iron-selector selected="[[page]]" attr-for-selected="name" class="drawer-list" role="navigation">
            <a name="members" href="[[rootPath]]members">Members</a>
            <a name="budget" href="[[rootPath]]budget">Budget</a>
            <a name="driveLink" href="[[rootPath]]driveLink">Google Drive</a>
          </iron-selector>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout index="appLayout" has-scrolling-region="">

          <app-header slot="header" condenses="" reveals="" effects="waterfall">
            <app-toolbar>
              <paper-icon-button icon="my-icons:menu" drawer-toggle=""></paper-icon-button>
              <div main-title="">Tau Dues Manager</div>
            </app-toolbar>
          </app-header>

          <iron-pages selected="[[page]]" attr-for-selected="name" role="main">
            <members-view name="members"></members-view>
            <budget-view name="budget"></budget-view>
            <my-view404 name="view404"></my-view404>
            <a id="driveLink" target="_blank" name="driveLink">LCA Drive</a>
          </iron-pages>
        </app-header-layout>
      </app-drawer-layout>
    `;
  }

  static get properties() {
    return {
      page: {
        type: String,
        value: "",
        reflectToAttribute: true,
        observer: '_pageChanged'
      },
      routeData: Object,
      subroute: Object,
      members: {
        type: Array,
        value: []
      }
    };
  }

  ready() {
    super.ready();
  }

  _googleAuthorized(data) {
    console.log("googleAuthorized", data)
  }

  static get observers() {
    return [
      '_routePageChanged(routeData.page)'
    ];
  }

  _routePageChanged(page) {
     // Show the corresponding page according to the route.
     //
     // If no page was found in the route data, page will be an empty string.
     // Show 'view1' in that case. And if the page doesn't exist, show 'view404'.
    if (!page) {
      this.page = 'members';
    } else if (['members', 'budget', 'driveLink'].indexOf(page) !== -1) {
      this.page = page;
    } else {
      this.page = 'view404';
    }

    // Close a non-persistent drawer when the page & route are changed.
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  _pageChanged(page) {
    // Import the page component on demand.
    //
    // Note: `polymer build` doesn't like string concatenation in the import
    // statement, so break it up.
    switch (page) {
      case 'members':
        import('./members-view.js');
        break;
      case 'budget':
        import('./budget-view.js');
        break;
      case 'driveLink':
        this.$.driveLink.href = LCA_DRIVE_HOME;
        this.$.driveLink.click();
        this.set('page', 'members');
        break;
      case 'view404':
        import('./my-view404.js');
        break;
    }
  }

  signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
  }
}

window.customElements.define('my-app', MyApp);
