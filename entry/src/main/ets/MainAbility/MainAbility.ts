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

// @ts-nocheck
import UIAbility from '@ohos.app.ability.UIAbility';
import { GlobalThisHelper, GlobalThisStorageKey} from '@ohos/common';
import { MediaSizeUtil } from '@ohos/common';
import AppStorageHelper from '../Common/Adapter/AppStorageHelper';
import { Log } from '@ohos/common';
import { Constants, AppStorageKeyName, PreferencesKey, HiTraceEvent } from '../../../../../common/src/main/ets/model/Constants';
import type common from '@ohos.app.ability.common';
import PreferencesAdapter from '../Common/Adapter/PreferencesAdapter';
import bundleManager from '@ohos.bundle.bundleManager';

const TAG = '[MainAbility]:';

export default class MainAbility extends UIAbility {
  private readonly PRIVACY_STATEMENT_STORE: string = 'privacyStatementStore';
  onCreate(want, launchParam) {
    Log.info(TAG, 'onCreate: ' + JSON.stringify(want) + ' launchParam : ' + JSON.stringify(launchParam));
    let jobId = want.parameters[Constants.WANT_JOB_ID_KEY];
    let fileList = want.parameters[Constants.WANT_FILE_LIST_KEY];
    let callerPid = want.parameters[Constants.WANT_CALLERPID_KEY];
    let pkgName: string = want.parameters[Constants.WANT_PKG_NAME_KEY];
    Log.info(TAG, 'fileList = ' + JSON.stringify(fileList));
    GlobalThisHelper.createValue<common.UIAbilityContext>(this.context, GlobalThisStorageKey.KEY_MAIN_ABILITY_CONTEXT, true);
    MediaSizeUtil.initMediaSizeLabel()
    this.context.eventHub.on(Constants.EVENT_GET_ABILITY_DATA, (data) => {
      data.wantJobId = jobId;
      data.wantFileList = fileList;
    });
    this.context.resourceManager.getConfiguration((error, value) => {
      AppStorageHelper.createValue<string>(<string> value.locale, AppStorageKeyName.CONFIG_LANGUAGE);
    });
    AppStorageHelper.createValue<string>(pkgName, AppStorageKeyName.INGRESS_PACKAGE);

    bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_DEFAULT)
      .then((bundleInfo) => {
        AppStorageHelper.createValue<string>(<string> bundleInfo.versionName, AppStorageKeyName.APP_VERSION);
      });
  }

  onDestroy() {
    Log.info(TAG, 'onDestroy');
  }

  onWindowStageCreate(windowStage) {
    // Main window is created, set main page for this ability
    Log.info(TAG, 'onWindowStageCreate');

    this.isFirstUsePrint().then((flag) => {
      windowStage.getMainWindow().then((window) => {
        window.resetSize(vp2px(Constants.MAIN_WINDOW_WIDTH), vp2px(Constants.MAIN_WINDOW_HEIGHT));
      }).catch((err) => {

      });

      Log.info(TAG, 'onWindowStageCreate flag: ' + JSON.stringify(flag));
      if (flag) {
        windowStage.setUIContent(this.context, 'pages/PrivacyStatementPage', null);
      } else {
        windowStage.setUIContent(this.context, 'pages/index', null);
      }
    });

    GlobalThisHelper.createValue(windowStage, GlobalThisStorageKey.KEY_MAIN_ABILITY_WINDOW_STAGE, true);
  }

  onWindowStageDestroy() {
    // Main window is destroyed, release UI related resources
    Log.info(TAG, 'onWindowStageDestroy');
    let adapter = GlobalThisHelper.getValue<PrintAdapter>(GlobalThisStorageKey.KEY_PRINT_ADAPTER);
    adapter.getPrinterDiscCtl().stopDiscovery('');
    let pixelMap = GlobalThisHelper.getValue<PixelMap>(GlobalThisStorageKey.KEY_CURRENT_PIXELMAP);
    if (pixelMap !== undefined) {
      pixelMap.release().then(() => {
        Log.log(TAG, 'onWindowStageDestroy currentPixelMap release success');
      });
    }

  }

  onConfigurationUpdated(config: Configuration): void {
    Log.info(TAG, 'onConfigurationUpdated, language:' + config.language);
    AppStorageHelper.createValue<string>(<string> config.language, AppStorageKeyName.CONFIG_LANGUAGE);
  }

  onForeground() {
    // Ability has brought to foreground
    Log.info(TAG, 'onForeground');
  }

  onBackground() {
    // Ability has back to background
    Log.info(TAG, 'onBackground');
  }

  async isFirstUsePrint(): boolean {
    Log.info(TAG, 'isFirstUsePrint start');
    const success = await PreferencesAdapter.getInstance().getOrCreatePreferencesSync(this.PRIVACY_STATEMENT_STORE);
    Log.info(TAG, 'isFirstUsePrint getOrCreatePreferencesSync success: ' + success);
    if (success) {
      const agreePrivacyStatement = await PreferencesAdapter.getInstance().getValue(PreferencesKey.KEY_PRIVACY_STATEMENT_PREFERENCES);
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
};
