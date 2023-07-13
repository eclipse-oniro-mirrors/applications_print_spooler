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

import { GlobalThisHelper, GlobalThisStorageKey, Log } from '@ohos/common';
import window from '@ohos.window';

const TAG = 'AboutPageComponent'
@Component
export struct AboutPageComponent {
  @State bckColor: Resource = $r('app.color.preview_background_color');

  build(){
    Image($r('app.media.ic_public_detail')).width($r('app.float.image_comp_width')).height($r('app.float.image_comp_height'))
      .onClick(() => {
        Log.info(TAG, 'PrivacyStatementPage onClick');
        var windowStage = GlobalThisHelper.getValue<window.WindowStage>(GlobalThisStorageKey.KEY_MAIN_ABILITY_WINDOW_STAGE);
        windowStage.createSubWindow('AboutPage')
          .then((windowMode) => {
            windowMode.setUIContent('pages/AboutPage')
            // @ts-ignore
            windowMode.setForbidSplitMove(false);
            windowMode.showWindow((err) => {
              if (err.code) {
                Log.info(TAG, 'Failed to show the window. Cause: ' + JSON.stringify(err))
                return
              }
              Log.info(TAG, 'Succeeded in showing the window.')
            })
          })
      })
      .backgroundColor(this.bckColor)
      .clip(new Circle({width: 24, height: 24})).onTouch((event) => {
      Log.info("ClickableImage", "event.type: " + JSON.stringify(event.type));
      if (event.type === TouchType.Down) {
        this.bckColor = $r('sys.color.ohos_fa_click_effect')
      } else if (event.type === TouchType.Up) {
        Log.info("ClickableImage", "onTouch is Up");
        this.bckColor = $r('app.color.preview_background_color');
      }
    })
  }
}