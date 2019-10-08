import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  call: getter.runningCalls.detailMapById(state)[props.match.params.call],
});

const mapAction = action => emit => ({
  updateCall(call) {
    emit(action.runningCalls.update(call));
  },
  showToast(message) {
    emit(action.toasts.create({ id: createId(), message }));
  },
});

class View extends Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
    pbx: PropTypes.object.isRequired,
  };

  render() {
    return (
      <UI
        call={this.props.call}
        back={routerUtils.goToCallsManage}
        join={this.join}
        stop={this.stop}
        hangup={this.hangup}
      />
    );
  }

  hangup = () => {
    const { sip } = this.context;
    sip.hangupSession(this.props.selectedId);
  };

  join = () => {
    const { pbx } = this.context;
    pbx
      .joinTalkerTransfer(
        this.props.call.pbxTenant,
        this.props.call.pbxTalkerId,
      )
      .then(this.onJoinSuccess, this.onJoinFailure);
  };

  onJoinSuccess = () => {
    this.props.updateCall({
      id: this.props.call.id,
      transfering: false,
    });
    routerUtils.goToCallsManage();
  };

  onJoinFailure = err => {
    console.error(err);
    this.props.showToast(`Failed to join the transfer`);
  };

  stop = () => {
    const { pbx } = this.context;
    pbx
      .stopTalkerTransfer(
        this.props.call.pbxTenant,
        this.props.call.pbxTalkerId,
      )
      .then(this.onStopSuccess, this.onStopFailure);
  };

  onStopSuccess = () => {
    this.props.updateCall({
      id: this.props.call.id,
      transfering: false,
    });
    routerUtils.goToCallsManage();
  };

  onStopFailure = err => {
    console.error(err);
    this.props.showToast(`Failed to stop the transfer`);
  };
}

export default createModelView(mapGetter, mapAction)(View);
