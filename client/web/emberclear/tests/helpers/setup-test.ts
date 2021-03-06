import WindowService from 'emberclear/services/window';

import { setupWorkers } from '@emberclear/crypto/test-support';
import { clearLocalStorage } from '@emberclear/local-account/test-support';

import { setupRelayConnectionMocks } from './setup-relay-connection-mocks';

import type { TestContext } from 'ember-test-helpers';

export function setupEmberclearTest(hooks: NestedHooks) {
  clearLocalStorage(hooks);
  setupWorkers(hooks);
  setupRelayConnectionMocks(hooks);
  setupWindow(hooks);
}

//////////////////////////////////

function setupWindow(hooks: NestedHooks) {
  hooks.beforeEach(function (this: TestContext) {
    class TestWindow extends WindowService {
      get location(): any {
        return {
          href: '',
        };
      }
    }

    this.owner.register('service:window', TestWindow);
  });
}
