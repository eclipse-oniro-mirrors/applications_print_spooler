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

import webview from '@ohos.web.webview';
import window from '@ohos.window';
import { Log } from '@ohos/common';
import { WindowErrorCode } from '../../../../../common/src/main/ets/model/Constants';
import router from '@ohos.router';
import { GlobalThisHelper, GlobalThisStorageKey} from '@ohos/common';
import { AppStorageKeyName} from '../../../../../common/src/main/ets/model/Constants';
import common from '@ohos.app.ability.common';
import AppStorageHelper from '../Common/Adapter/AppStorageHelper';
import {CancelButton, ClickableImage} from './component/BaseComponent';

const TAG = 'PrivacyStatementWebPage';

@Entry
@Component
struct PrivacyStatementWebPage {
  @State @Watch('languageChange') language: string = AppStorageHelper.getValue(AppStorageKeyName.CONFIG_LANGUAGE);
  private abilityContext: common.UIAbilityContext = GlobalThisHelper
    .getValue<common.UIAbilityContext>(GlobalThisStorageKey.KEY_MAIN_ABILITY_CONTEXT);
  private webController: webview.WebviewController = new webview.WebviewController();
  private privacyStatementFlag: boolean = false;
  private baseUrl: string;
  private url: string;

  aboutToAppear() {
    let storage = LocalStorage.GetShared();
    if (storage) {
      this.privacyStatementFlag = storage.get<boolean>('privacyStatementFlag');
    }
    Log.info(TAG, 'privacyStatementFlag: ' + this.privacyStatementFlag);
    this.languageToWebUrl();
    this.setLanguageChangeCallback();
  }

  build() {
    Column() {
      Column() {
        ClickableImage({
          imageSrc: $r('app.media.ic_back'),
          imageHeight: $r('app.float.privacy_statement_text_headline_height'),
          imageWidth: $r('app.float.privacy_statement_text_headline_height'),
          setting: {hoverAble: true},
          clickEvent: () => {
            this.onBack();
          }
        }).margin({left: $r('app.float.shield_width_height')})
      }
      .margin({top: $r('app.float.privacy_statement_text_headline_height')})
      .alignItems(HorizontalAlign.Start)
      .width('100%')
      .height($r('app.float.privacy_statement_text_margin_left_right'))
      Column() {
        Column() {
          Web({src: this.url, controller: this.webController})
            .width('100%')
            .height('100%')
        }
        .height('75%')
        .width('100%')
        Column() {
          CancelButton({
            cancelLabel: $r('app.string.Cancel'),
            cancelWidth: $r('app.float.about_button_width'),
            cancelHeight: $r('app.float.privacy_statement_button_height'),
            cancelClick: () => {
              this.closeWindow();
            }
          })
            .margin({
              top: $r('app.float.privacy_statement_button_to_text_margin_top')
            })
        }
        .width('100%')
        .alignItems(HorizontalAlign.Center)
        .visibility(this.privacyStatementFlag ? Visibility.None : Visibility.Visible)
      }
      .margin({
        bottom: this.privacyStatementFlag ? 0
                                          : $r('app.float.privacy_statement_button_margin_bottom')
      })
    }
    .width('100%')
    .height('100%')
    .alignItems(HorizontalAlign.Center)
  }


  private onBack() {
    try {
      let result = this.webController.accessBackward();
      if (result) {
        this.webController.backward();
      } else {
        let page = router.getState();
        Log.info(TAG, 'page index = ' + page.index);
        Log.info(TAG, 'page name = ' + page.name);
        Log.info(TAG, 'page path = ' + page.path);
        Log.info(TAG, "onBack parseInt(router.getLength()): " + parseInt(router.getLength()));
        if (parseInt(router.getLength()) > 1) {
          router.back({url: 'pages/AboutPage'})
        } else {
          this.closeWindow();
        }
      }
    } catch (error) {
      console.error(`Errorcode: ${error.code}, Message: ${error.message}`);
    }
  }

  private closeWindow() {
    try {
      var windowClass = window.findWindow('PrivacyStatementWebPage');
    } catch (exception) {
      Log.info(TAG, 'findWindow exception: ' + JSON.stringify(exception));
      if (WindowErrorCode.WINDOW_STATE_ABNORMAL === exception.code) {
        windowClass = window.findWindow('AboutPage');
      }
    }
    if (windowClass) {
      windowClass.destroyWindow(() => {
        Log.info(TAG, 'Succeeded in destroying the window');
      })
    }
  }

  private languageChange():void {
    Log.info(TAG, 'languageChange language: ' + this.language);
    this.languageToWebUrl();
    Log.info(TAG, 'languageChange url: ' + this.url);
    this.webController.loadUrl(this.url);
    Log.info(TAG, 'web url: ' + this.webController.getUrl());
  }

  private languageToWebUrl() {
    let languageCode = 'en-US';
    if (this.language.substr(0, 2) === 'zh') {
      languageCode = 'zh-CN';
    }
    this.baseUrl = this.abilityContext.resourceManager.getStringByNameSync('privacy_statement_web_base_url');
    Log.info(TAG, "languageToWebUrl baseUrl: " + this.baseUrl);
    this.url = this.baseUrl + languageCode;
  }

  private setLanguageChangeCallback() {
    let envCallback = {
      bindThis(that) {
        this.that = that;
      },
      onConfigurationUpdated(config) {
        this.that.language = config.language.substr(0, 2);
        Log.info(TAG, 'onConfigurationUpdated language: ' + JSON.stringify(this.that.language));
      },
      onMemoryLevel() {}
    };
    envCallback.bindThis(this);
    try {
      if (this.abilityContext) {
        let applicationContext = this.abilityContext.getApplicationContext();
        applicationContext.on('environment', envCallback);
      }
    } catch (paramError) {
      console.error('error: ${paramError.code}, ${paramError.message}');
    }
  }
}