import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import * as routerUtils from '../../mobx/routerStore';
import { validateHostname, validatePort } from '../../util/validator';
import UI from './ui';

const mapGetter = getter => (state, props) => ({});
const mapAction = action => emit => ({
  createProfile(profile) {
    emit(action.profiles.create(profile));
  },
  showToast(message) {
    emit(action.toasts.create({ id: createId(), message }));
  },
});

class View extends Component {
  state = {
    pbxHostname: ``,
    pbxPort: ``,
    pbxTenant: ``,
    pbxUsername: ``,
    pbxPassword: ``,
    pbxPhoneIndex: `4`,
    pbxTurnEnabled: false,
    pushNotificationEnabled: true,
    ucEnabled: false,
    ucHostname: ``,
    ucPort: ``,
    parks: [],
    addingPark: ``,
  };

  render() {
    return (
      <UI
        pbxHostname={this.state.pbxHostname}
        pbxPort={this.state.pbxPort}
        pbxTenant={this.state.pbxTenant}
        pbxUsername={this.state.pbxUsername}
        pbxPassword={this.state.pbxPassword}
        pbxPhoneIndex={this.state.pbxPhoneIndex}
        pbxTurnEnabled={this.state.pbxTurnEnabled}
        pushNotificationEnabled={this.state.pushNotificationEnabled}
        parks={this.state.parks}
        addingPark={this.state.addingPark}
        ucEnabled={this.state.ucEnabled}
        ucHostname={this.state.ucHostname}
        ucPort={this.state.ucPort}
        setPBXHostname={this.setPBXHostname}
        setPBXPort={this.setPBXPort}
        setPBXTenant={this.setPBXTenant}
        setPBXUsername={this.setPBXUsername}
        setPBXPassword={this.setPBXPassword}
        setPBXPhoneIndex={this.setPBXPhoneIndex}
        setPBXTurnEnabled={this.setPBXTurnEnabled}
        setPushNotificationEnabled={this.setPushNotificationEnabled}
        setAddingPark={this.setAddingPark}
        submitAddingPark={this.submitAddingPark}
        setUCEnabled={this.setUCEnabled}
        setUCHostname={this.setUCHostname}
        setUCPort={this.setUCPort}
        removePark={this.removePark}
        save={this.save}
        back={routerUtils.goToProfilesManage}
      />
    );
  }

  setPBXHostname = pbxHostname => {
    this.setState({ pbxHostname });
  };
  setPBXPort = pbxPort => {
    this.setState({ pbxPort });
  };
  setPBXTenant = pbxTenant => {
    this.setState({ pbxTenant });
  };
  setPBXUsername = pbxUsername => {
    this.setState({ pbxUsername });
  };
  setPBXPassword = pbxPassword => {
    this.setState({ pbxPassword });
  };
  setPBXPhoneIndex = pbxPhoneIndex => {
    this.setState({ pbxPhoneIndex });
  };
  setPBXTurnEnabled = pbxTurnEnabled => {
    this.setState({ pbxTurnEnabled });
  };
  setPushNotificationEnabled = pushNotificationEnabled => {
    this.setState({ pushNotificationEnabled });
  };

  _isStringEmpty = s => {
    return !s && 0 === s.length;
  };

  setUCEnabled = ucEnabled => {
    if (ucEnabled) {
      if (
        this._isStringEmpty(this.state.ucHostname) &&
        this._isStringEmpty(this.state.ucPort)
      ) {
        if (
          !this._isStringEmpty(this.state.pbxHostname) &&
          !this._isStringEmpty(this.state.pbxPort)
        ) {
          this.setUCHostname(this.state.pbxHostname);
          this.setUCPort(this.state.pbxPort);
        }
      }
    }
    this.setState({ ucEnabled });
  };

  setUCHostname = ucHostname => {
    this.setState({ ucHostname });
  };

  setUCPort = ucPort => {
    this.setState({ ucPort });
  };

  setAddingPark = addingPark => {
    this.setState({
      addingPark: addingPark.trim(),
    });
  };

  submitAddingPark = () => {
    const { addingPark, parks } = this.state;

    if (!addingPark) {
      return;
    }

    if (/[^a-z0-9_]/.test(addingPark)) {
      this.props.showToast(`Invalid park number`);
      return;
    }

    this.setState({
      parks: [addingPark, ...parks.filter(_ => _ !== addingPark)],
      addingPark: ``,
    });
  };

  removePark = park => {
    this.setState(prevState => ({
      parks: prevState.parks.filter(_ => _ !== park),
    }));
  };

  missingRequired = () =>
    !this.state.pbxHostname ||
    !this.state.pbxPort ||
    !this.state.pbxUsername ||
    !this.state.pbxPassword ||
    (this.state.ucEnabled && (!this.state.ucHostname || !this.state.ucPort));

  save = () => {
    if (this.missingRequired()) {
      this.props.showToast(`Missing required fields`);
      return;
    }

    if (!validateHostname(this.state.pbxHostname)) {
      this.props.showToast(`Host name is invalid`);
      return;
    }
    if (!validatePort(this.state.pbxPort)) {
      this.props.showToast(`Port is invalid`);
      return;
    }

    const pbxHostname = this.state.pbxHostname.trim();
    const pbxPort = this.state.pbxPort.trim();
    const pbxTenant = this.state.pbxTenant.trim();
    const pbxUsername = this.state.pbxUsername.trim();
    const pbxPassword = this.state.pbxPassword.trim();
    const pbxPhoneIndex = this.state.pbxPhoneIndex;
    const pbxTurnEnabled = this.state.pbxTurnEnabled;
    const pushNotificationEnabled = this.state.pushNotificationEnabled;
    const ucHostname = this.state.ucHostname.trim();
    const ucPort = this.state.ucPort.trim();
    const parks = [];
    for (let i = 0; i < this.state.parks.length; i++) {
      parks.push(this.state.parks[i].trim());
    }

    this.props.createProfile({
      id: createId(),
      pbxHostname: pbxHostname,
      pbxPort: pbxPort,
      pbxTenant: pbxTenant,
      pbxUsername: pbxUsername,
      pbxPassword: pbxPassword,
      pbxPhoneIndex: pbxPhoneIndex,
      pbxTurnEnabled: pbxTurnEnabled,
      pushNotificationEnabled: pushNotificationEnabled,
      parks: parks,
      ucEnabled: this.state.ucEnabled,
      ucHostname: ucHostname,
      ucPort: ucPort,
    });

    routerUtils.goToProfilesManage();
  };
}

export default createModelView(mapGetter, mapAction)(View);
