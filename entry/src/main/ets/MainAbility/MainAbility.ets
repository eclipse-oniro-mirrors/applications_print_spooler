/*
 * Copyright (c) 2023-2023 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { configMgr, GlobalObject, GlobalThisHelper, GlobalThisStorageKey, MediaSizeHelper } from '@ohos/common';
import AppStorageHelper from '../Common/Adapter/AppStorageHelper';
import { Log } from '@ohos/common';
import { Constants, AppStorageKeyName, PreferencesKey } from '@ohos/common';
import type common from '@ohos.app.ability.common';
import PreferencesAdapter from '../Common/Adapter/PreferencesAdapter';
import bundleManager from '@ohos.bundle.bundleManager';
import PrintAdapter from '../Common/Adapter/PrintAdapter';
import { Configuration } from '@ohos.app.ability.Configuration';
import image from '@ohos.multimedia.image';
import Want from '@ohos.app.ability.Want';
import UIExtensionAbility from '@ohos.app.ability.UIExtensionAbility';
import UIExtensionContentSession from '@ohos.app.ability.UIExtensionContentSession';
import CheckEmptyUtils from '@ohos/common';
import Queue from '@ohos.util.Queue';
import Util from '../Common/Utils/Util';
import type { PrintAttributes } from '@ohos/common';

const TAG = '[MainAbility]:';

export default class MainAbility extends UIExtensionAbility {
  private lock: boolean = false;
  private storeRequest = new Queue<RequestDialogModel>();
  private readonly PRIVACY_STATEMENT_STORE: string = 'privacyStatementStore';
  private session: UIExtensionContentSession | undefined = undefined;

  onCreate(): void {
    GlobalThisHelper.createValue<common.UIExtensionContext>(this.context, GlobalThisStorageKey.KEY_MAIN_ABILITY_CONTEXT, true);
    MediaSizeHelper.init(this.context);
    this.context.resourceManager.getConfiguration((error, value) => {
      AppStorageHelper.createValue<string>(value.locale as string, AppStorageKeyName.CONFIG_LANGUAGE);
    });

    bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_DEFAULT)
      .then((bundleInfo) => {
        AppStorageHelper.createValue<string>(bundleInfo.versionName as string, AppStorageKeyName.APP_VERSION);
      });
    this.subscribe();
  }

  onDestroy() {
    // Main window is destroyed, release UI related resources
    Log.info(TAG, 'onDestroy');
    let adapter = GlobalThisHelper.getValue<PrintAdapter>(GlobalThisStorageKey.KEY_PRINT_ADAPTER);
    let previewPageInstances: number = AppStorageHelper.getValue(AppStorageKeyName.PREVIEW_PAGE_INSTANCE) as number;
    if (previewPageInstances === 1) {
      adapter?.getPrinterDiscCtl()?.stopDiscovery('');
      this.unsubscribe();
    }
    AppStorageHelper.createValue<number>(previewPageInstances - 1, AppStorageKeyName.PREVIEW_PAGE_INSTANCE);
    let pixelMap = GlobalThisHelper.getValue<image.PixelMap>(GlobalThisStorageKey.KEY_CURRENT_PIXELMAP);
    if (pixelMap !== undefined) {
      pixelMap.release().then(() => {
        Log.info(TAG, 'onDestroy currentPixelMap release success');
      });
    }
    GlobalObject.getInstance().removeObject(Constants.PREVIEW_IS_VERTICAL);
    GlobalObject.getInstance().removeObject(Constants.PREVIEW_DIALOG_COUNT);
    let res = AppStorageHelper.deleteValue(AppStorageKeyName.imageSourcesName);
    Log.info(TAG, 'delete imageSources:' + res);
  }

  onSessionCreate(want: Want, session: UIExtensionContentSession): void {
    Log.info(TAG + 'onSessionCreate, want: ' + JSON.stringify(want));
    this.session = session;
    let fileList: string[] = [];
    let callerPid: string = '';
    let pkgName: string = '';
    let docName: string = '';
    let attributes: string = '';
    let jobId: string = '';
    if (want.parameters !== undefined) {
      fileList = want.parameters[Constants.WANT_FILE_LIST_KEY] as string[];
      Log.info(TAG + 'fileList: ' + JSON.stringify(fileList));

      callerPid = want.parameters[Constants.WANT_CALLERPID_KEY] as string;
      pkgName = want.parameters[Constants.WANT_PKG_NAME_KEY] as string;
      docName = want.parameters[Constants.WANT_DOCUMENT_NAME_KEY] as string;
      attributes = want.parameters[Constants.wantPrintAttributeKey] as string;
      jobId = want.parameters[Constants.WANT_JOB_ID_KEY] as string;
    }
    let printAttributes: PrintAttributes | undefined = undefined;
    if (!CheckEmptyUtils.checkStrIsEmpty(attributes)) {
      printAttributes = JSON.parse(attributes);
    }
    this.storeRequest.add(new RequestDialogModel(fileList, callerPid, pkgName, docName, printAttributes, jobId));
    this.consumeRequest();
  }

  private consumeRequest(): void {
    if (this.storeRequest.length === 0) {
      Log.warn(TAG, 'no dialogRequest in queue.');
      return;
    }
    if (this.lock) {
      Log.warn(TAG, 'consumer is busying: need waiting');
      return;
    }
    this.handleDialogRequest(this.storeRequest.pop(), this.requestCompleteCallback);
  }

  private async handleDialogRequest(model: RequestDialogModel, callback: (id: string) => void): Promise<void> {
    GlobalThisHelper.createValue<string>(model.jobId, GlobalThisStorageKey.KEY_JOB_ID);
    let dialogId = Util.getPreviewDialogId(model.jobId);
    let pkgNameMap: Map<string, string> = AppStorageHelper.getValue<Map<string, string>>(
      AppStorageKeyName.INGRESS_PACKAGE) ?? new Map<string, string>();
    let docNameMap: Map<string, string> = AppStorageHelper.getValue<Map<string, string>>(
      AppStorageKeyName.DOCUMENT_NAME) ?? new Map<string, string>();
    let previewPageInstances: number = AppStorageHelper.getValue(AppStorageKeyName.PREVIEW_PAGE_INSTANCE) ?? 0;
    pkgNameMap.set(dialogId, model.pkgName);
    docNameMap.set(dialogId, model.docName);
    AppStorageHelper.createValue<Map<string, string>>(pkgNameMap, AppStorageKeyName.INGRESS_PACKAGE);
    AppStorageHelper.createValue<Map<string, string>>(docNameMap, AppStorageKeyName.DOCUMENT_NAME);
    let storage: LocalStorage = new LocalStorage();
    storage.setOrCreate<string>(Constants.WANT_JOB_ID_KEY, model.jobId);
    storage.setOrCreate(Constants.WANT_FILE_LIST_KEY, model.fileList ?? new Array<string>());
    storage.setOrCreate(Constants.wantPrintAttributeKey, model.printAttributes);
    storage.setOrCreate(Constants.WINDOW_ID, dialogId);
    storage.setOrCreate(Constants.SESSION, this.session);

    let pageUrl = Constants.PRINT_PREVIEW_PAGE_URL;
    await this.isFirstUsePrint().then((flag) => {
      Log.info(TAG, 'isFirstUsePrint : ' + flag);
      if (flag) {
        pageUrl = Constants.PRIVACY_STATEMENT_PAGE_URL;
      } else {
        pageUrl = Constants.PRINT_PREVIEW_PAGE_URL;
      }
    });
    GlobalObject.getInstance().setObject(Constants.PREVIEW_DIALOG_COUNT,
      (GlobalObject.getInstance().getObject(Constants.PREVIEW_DIALOG_COUNT) as number) + 1);

    this.session?.loadContent(pageUrl, storage);
    this.session?.setWindowBackgroundColor('#40000000');
    AppStorageHelper.createValue<number>(previewPageInstances + 1, AppStorageKeyName.PREVIEW_PAGE_INSTANCE);
    callback(dialogId);
    Log.debug(TAG, 'handleDialogRequest end.');
  }

  private requestCompleteCallback = (dialogId: string): void => {
    Log.info(TAG, `requestCompleteCallback CreateWindow:${JSON.stringify(dialogId)} completed`);
    this.lock = false;
    this.consumeRequest();
  };

  onConfigurationUpdated(config: Configuration): void {
    Log.info(TAG, 'onConfigurationUpdated, language:' + config.language);
    AppStorageHelper.createValue<string>(config.language as string, AppStorageKeyName.CONFIG_LANGUAGE);
  }

  onForeground() {
    // Ability has brought to foreground
    Log.info(TAG, 'onForeground');
  }

  onBackground() {
    // Ability has back to background
    Log.info(TAG, 'onBackground');
  }

  async isFirstUsePrint(): Promise<boolean> {
    Log.info(TAG, 'isFirstUsePrint start');
    const success = await PreferencesAdapter.getInstance().getOrCreatePreferencesSync(this.PRIVACY_STATEMENT_STORE);
    Log.info(TAG, 'isFirstUsePrint getOrCreatePreferencesSync success: ' + success);
    if (success) {
      const agreePrivacyStatement = await PreferencesAdapter.getInstance()
        .getValue(PreferencesKey.KEY_PRIVACY_STATEMENT_PREFERENCES);
      Log.info(TAG, 'isFirstUsePrint getValue agreePrivacyStatement: ' + agreePrivacyStatement);
      if (agreePrivacyStatement) {
        return false;
      } else {
        return true;
      }
    } else {
      Log.info(TAG, 'isFirstUsePrint success is not');
      return true;
    }
  }

  private subscribe(): void {
    configMgr.onStart(this.context);
  }

  private unsubscribe(): void {
    configMgr.onStop();
  }
};

class RequestDialogModel {
  fileList: Array<string>;
  callerPid: string;
  pkgName: string;
  docName: string;
  printAttributes: PrintAttributes | undefined;
  jobId: string;

  constructor(fileList: Array<string>, callerPid: string, pkgName: string, docName: string,
              printAttributes: PrintAttributes | undefined, jobId: string) {
    this.fileList = fileList;
    this.callerPid = callerPid;
    this.pkgName = pkgName;
    this.docName = docName;
    this.printAttributes = printAttributes;
    this.jobId = jobId;
  }
}
