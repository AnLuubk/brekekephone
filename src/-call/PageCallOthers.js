import { mdiPhone, mdiPhoneHangup } from '@mdi/js';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import UserItem from '../-contact/UserItem';
import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import Layout from '../shared/Layout';
import { arrToMap } from '../utils/toMap';

@observer
class PageCallOthers extends React.Component {
  @computed get runningIds() {
    return callStore.runnings.map(c => c.id);
  }
  @computed get runningById() {
    return arrToMap(callStore.runnings, `id`, c => c);
  }
  hangupFunc = id => {
    const u = callStore.runnings.map(c => {
      return this.runningById[c.id];
    });
    sip.hangupSession(id);
    if (u.length <= 1) {
      g.backToPageCallRecents();
    }
  };

  hangup = id => {
    const call = this.runningById[id];
    if (!call?.holding) {
      this.hangupFunc();
    } else {
      pbx
        .unholdTalker(call.pbxTenant, call.pbxTalkerId)
        .then(this.onUnholdSuccess)
        .then(this.hangupFunc(call?.id))
        .catch(this.onUnholdFailure);
    }
  };
  setSelectedId = id => {
    callStore.set(`selectedId`, id);
    g.backToPageCallManage();
  };
  render() {
    const u = callStore.runnings.map(c => {
      return this.runningById[c.id];
    });
    return (
      <Layout
        compact
        noScroll
        onBack={g.backToPageCallManage}
        title={intl`Background calls`}
      >
        {u.map(call => (
          <UserItem
            iconFuncs={[
              () => this.setSelectedId(call?.id),
              () => {
                this.hangup(call?.id);
              },
            ]}
            icons={[mdiPhone, mdiPhoneHangup]}
            key={call?.id}
            {...call}
          />
        ))}
      </Layout>
    );
  }
}

export default PageCallOthers;