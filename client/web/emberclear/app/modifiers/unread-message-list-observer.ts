import { inject as service } from '@ember/service';

import { timeout } from 'ember-concurrency';
import { enqueueTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import Modifier from 'ember-modifier';

import { isInElementWithinViewport } from 'emberclear/utils/dom/utils';

import { markAsRead } from '@emberclear/networking/models/message/utils';

import type StoreService from '@ember-data/store';
import type { Message } from '@emberclear/networking';
import type SidebarService from 'emberclear/services/sidebar';

export default class UnreadMessagesIntersectionObserver extends Modifier {
  @service declare sidebar: SidebarService;
  @service declare store: StoreService;

  focusHandler!: () => void;

  didInstall() {
    this.focusHandler = this.respondToWindowFocus.bind(this);

    window.addEventListener('focus', this.focusHandler);
  }

  willRemove() {
    window.removeEventListener('focus', this.focusHandler);
  }

  private respondToWindowFocus() {
    const container = document.querySelector('.messages')!;
    // TODO: add unread status to the DOM, and then only query unread messages
    const messages = container.querySelectorAll('.message');

    messages.forEach((message) => {
      const isVisible = isInElementWithinViewport(message, container);

      if (isVisible) {
        const record = this.store.peekRecord('message', message.id);

        if (record) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          taskFor(this.markRead).perform(record);
        }
      }
    });
  }

  @enqueueTask({ withTestWaiter: true, maxConcurrency: 30 })
  async markRead(message: Message) {
    let attempts = 0;

    while (attempts < 100) {
      attempts++;

      if (message.readAt) {
        return;
      }

      if (message.isSaving || !document.hasFocus()) {
        await timeout(10);
      } else {
        await markAsRead(message);

        if (message.sender && message.sender.numUnread > 0) {
          message.sender.numUnread--;
        }

        return;
      }
    }
  }
}
