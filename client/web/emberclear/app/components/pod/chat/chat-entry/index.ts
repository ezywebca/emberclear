import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

import { unicode } from 'emojis';

import { Channel } from '@emberclear/local-account';

import type StoreService from '@ember-data/store';
import type { Contact } from '@emberclear/local-account';
import type { MessageDispatcher, MessageFactory } from '@emberclear/networking';

const EMOJI_REGEX = /:[^:]+:/g;

interface IArgs {
  to: Contact | Channel;
}

export default class ChatEntry extends Component<IArgs> {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;
  @service('messages/factory') messageFactory!: MessageFactory;
  @service store!: StoreService;

  @tracked isDisabled = false;
  @tracked isSubmitDisabled = true;

  declare text?: string;

  get placeholder() {
    const { to } = this.args;
    let prefix = '';

    if (to instanceof Channel) {
      prefix = 'everyone in ';
    }

    return `Send a message to ${prefix}${to.name}`;
  }

  @action
  async sendMessage() {
    if (!this.text) return;

    this.isDisabled = true;

    await this.dispatchMessage(this.text);

    this.isDisabled = false;
    this.updateText('');
  }

  @action
  updateText(text: string) {
    set(this, 'text', text);

    this.isSubmitDisabled = this.isDisabled || !text || text.length === 0;
  }

  @action
  onInput(event: KeyboardEvent) {
    const value = (event.target as any).value;

    // TODO: only test the regex since the last detected `:`
    // (for perf)
    if (EMOJI_REGEX.test(value)) {
      this.updateText(unicode(value));
    } else {
      this.updateText(value);
    }
  }

  @action
  onKeyPress(event: KeyboardEvent) {
    const { keyCode, shiftKey } = event;

    // don't submit when shift is being held.
    if (!shiftKey && keyCode === 13) {
      // non-blocking
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.sendMessage();

      // prevent regular 'Enter' from inserting a linebreak
      return false;
    }

    return true;
  }

  async dispatchMessage(text: string) {
    await waitForPromise(this.messageDispatcher.send(text, this.args.to));
  }
}
