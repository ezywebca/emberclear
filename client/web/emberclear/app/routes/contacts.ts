import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type { CurrentUserService } from '@emberclear/local-account';

export default class ContactsRoute extends Route {
  @service declare currentUser: CurrentUserService;

  async beforeModel() {
    const exists = await this.currentUser.exists();

    if (!exists) {
      await this.transitionTo('setup');
    }
  }
}
