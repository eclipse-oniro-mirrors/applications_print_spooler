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
import { Log } from '@ohos/common';
import type common from '@ohos.app.ability.common';
import { GlobalThisHelper, GlobalThisStorageKey} from '@ohos/common';
import { Constants } from '@ohos/common';

const TAG = 'JobManagerAbility';

export default class JobManagerAbility extends UIAbility {
  onCreate(want, launchParam): void {
    Log.info(TAG, 'onCreate');
    GlobalThisHelper.createValue<common.UIAbilityContext>(this.context, GlobalThisStorageKey.KEY_JOB_MANAGER_ABILITY_CONTEXT, true);
    let jobId = want.parameters[Constants.WANT_JOB_ID_KEY];
    this.context.eventHub.on(Constants.EVENT_GET_ABILITY_DATA, (data) => {
      data.wantJobId = jobId;
    });
  }

  onDestroy(): void {
    Log.info(TAG, 'onDestroy');
  }

  onWindowStageCreate(windowStage): void {
    // Main window is created, set main page for this ability
    Log.info(TAG, 'onWindowStageCreate');
    // windowStage.getMainWindow().then((window) => {
    //   window.resetSize(vp2px(Constants.MAIN_WINDOW_WIDTH), vp2px(Constants.MAIN_WINDOW_HEIGHT));
    // }).catch((err) => {
    //   Log.error(TAG, 'Failed to obtain the main window. Cause: ' + JSON.stringify(err));
    // });

    windowStage.setUIContent(this.context, 'pages/JobManagerPage', null);
  }

  onWindowStageDestroy(): void {
    // Main window is destroyed, release UI related resources
    Log.info(TAG, 'onWindowStageDestroy');
    let adapter = GlobalThisHelper.getValue<PrintAdapter>(GlobalThisStorageKey.KEY_PRINT_ADAPTER);
    adapter.destroy();
  }

  onForeground(): void {
    // Ability has brought to foreground
    Log.info(TAG, 'onForeground');
  }

  onBackground(): void {
    // Ability has back to background
    Log.info(TAG, 'onBackground');
  }
};
