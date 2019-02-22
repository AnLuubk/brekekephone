import { Platform } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import * as ImagePicker from 'react-native-full-image-picker';
import ActionSheet from 'react-native-general-actionsheet';

ActionSheet.useActionSheetIOS = true;

const actionSheetOptions = {
  options: [
    'Select from photo library',
    'Take a new photo',
    'Take a new video',
    'More...',
    'Cancel',
  ],
  destructiveButtonIndex: 4,
  cancelButtonIndex: 4,
};

const actionSheetHandlers = [
  () =>
    new Promise(resolve => {
      ImagePicker.getAlbum({
        callback: arr => resolve(arr[0]),
        maxSize: 1,
      });
    }),
  () =>
    new Promise(resolve => {
      ImagePicker.getCamera({
        callback: arr => resolve(arr[0]),
        maxSize: 1,
      });
    }),
  () =>
    new Promise(resolve => {
      ImagePicker.getVideo({
        callback: arr => resolve(arr[0]),
      });
    }),
  () =>
    DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    }),
];

async function pickFileNative(cb) {
  const i = await new Promise(resolve => {
    ActionSheet.showActionSheetWithOptions(actionSheetOptions, resolve);
  });
  const fn = actionSheetHandlers[i];
  if (!fn) {
    return;
  }
  //
  let file = null;
  try {
    file = await fn();
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      return;
    }
    throw err;
  }
  if (!file) {
    return;
  }
  //
  const { uri } = file;
  if (!uri) {
    return;
  }
  let name =
    file.fileName ||
    file.filename ||
    uri
      .split(/[\\/]/g)
      .pop()
      .replace(/\?[^.]+$/, '');
  let size = file.fileSize || file.filesize || file.size || 0;
  //
  cb({ uri, name, size });
}

function pickFileWeb(cb) {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = function() {
    cb(this.files[0]);
  };
  input.click();
}

function pickFile(cb) {
  const fn = Platform.OS === 'web' ? pickFileWeb : pickFileNative;
  return fn(cb);
}

export default pickFile;
