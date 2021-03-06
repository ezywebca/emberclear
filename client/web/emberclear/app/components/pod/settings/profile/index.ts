import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import type { CurrentUserService } from '@emberclear/local-account';
import type Settings from 'emberclear/services/settings';

export default class ProfileSettings extends Component {
  @service declare currentUser: CurrentUserService;
  @service declare toast: Toast;
  @service declare settings: Settings;

  get name() {
    return this.currentUser.record?.name;
  }

  @action
  async save(e: Event) {
    e.preventDefault();

    await this.currentUser.record!.save();

    this.toast.success('Identity Updated');
  }

  @action
  async downloadSettings() {
    const settings = await this.settings.buildData();

    if (!settings) return;

    const link = document.createElement('a');

    link.setAttribute('download', 'emberclear.settings');
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
    link.setAttribute('href', settings);

    link.click();
    link.remove();
  }
}
