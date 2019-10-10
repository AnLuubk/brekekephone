let profilesManageInstance = null;

// To get/set the profilesManageInstance to use in other places
// TODO fix this using mobx stores
export const setProfilesManager = v => {
  profilesManageInstance = v;
};
export const getProfilesManager = () => {
  return profilesManageInstance;
};
export const getProfilesManagerInterval = () => {
  if (profilesManageInstance) {
    return Promise.resolve(profilesManageInstance);
  }
  return new Promise(resolve => {
    // Use interval to wait until the profile manager constructed
    let eslapsed = 0;
    const intervalId = setInterval(() => {
      if (!profilesManageInstance) {
        if (eslapsed >= 60) {
          // 60 secs timeout
          resolve(null);
          clearInterval(intervalId);
        }
        eslapsed += 1;
        return;
      }
      resolve(profilesManageInstance);
      clearInterval(intervalId);
    }, 1000);
  });
};

const compareField = (v1, v2) => !v1 || !v2 || v1 === v2;
export const compareNotiProfile = (n, p) =>
  compareField(n.tenant, p.pbxTenant) &&
  compareField(n.to, p.pbxUsername) &&
  compareField(n.pbxHostname, p.pbxHostname) &&
  compareField(n.pbxPort, p.pbxPort);

let profiles = [];
export const getProfiles = () => profiles;
export const setProfiles = arr => {
  profiles = arr;
};
