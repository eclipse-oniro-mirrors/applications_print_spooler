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

// @ts-ignore
import print from '@ohos.print';
import wifi from '@ohos.wifi';
import abilityAccessCtrl from '@ohos.abilityAccessCtrl';
import bundleManager from '@ohos.bundle.bundleManager';
import { Log } from './Log';
import { WIFI_INACTIVE } from '../model/ErrorMessage';

const TAG: string = 'Permission';

export function checkWifiEnable(): boolean {
  let wifiStatus: boolean = wifi.isWifiActive();
  if (!wifiStatus) {
    //wifi 关闭
    Log.error(TAG, 'wifi is inactive');
    //wifi关闭了, 上报异常
    print.updateExtensionInfo(JSON.stringify(WIFI_INACTIVE));
  }
  return wifiStatus;
}

/**
 * checkPermission
 *
 * @param accessTokenId
 */
export async function checkPermission(): Promise<boolean> {
  Log.debug(TAG, 'checkPermission enter');
  let bundleInfo: bundleManager.BundleInfo = await bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION);
  if (bundleInfo === undefined || bundleInfo === null) {
    Log.error(TAG, 'bundleInfo is undefined');
    return false;
  }
  if (bundleInfo.appInfo === undefined || bundleInfo === null) {
    Log.error(TAG, 'bundleInfo.appInfo is undefined');
    return false;
  }
  const accessTokenId = bundleInfo.appInfo.accessTokenId;
  let atManager: abilityAccessCtrl.AtManager = <abilityAccessCtrl.AtManager>abilityAccessCtrl.createAtManager();
  if (atManager === undefined) {
    Log.error(TAG, 'atManager is undefined');
    return false;
  }
  Log.debug(TAG, 'get accessTokenId');
  let status = atManager.verifyAccessTokenSync(accessTokenId, 'ohos.permission.APPROXIMATELY_LOCATION');
  if (status === abilityAccessCtrl.GrantStatus.PERMISSION_DENIED) {
    Log.info(TAG, 'hasPermission APPROXIMATELY_LOCATION: false');
    return false;
  }
  status = atManager.verifyAccessTokenSync(accessTokenId, 'ohos.permission.LOCATION');
  if (status === abilityAccessCtrl.GrantStatus.PERMISSION_DENIED) {
    Log.info(TAG, 'hasPermission APPROXIMATELY_LOCATION: false');
    return false;
  }
  Log.info(TAG, 'hasPermission: true');
  return true;
}

export function requestPermission(context, callback: () => void): void {
  Log.info(TAG, 'requestPermission enter');
  let atManager = abilityAccessCtrl.createAtManager();
  try {
    atManager.requestPermissionsFromUser(context, ['ohos.permission.APPROXIMATELY_LOCATION', 'ohos.permission.LOCATION']).then((requestResult) => {
      let isAuth = true;
      for (let result of requestResult.authResults) {
        if (result !== 0) {
          isAuth = false;
        }
      }
      if (isAuth) {
        Log.info(TAG, 'request permission success');
        callback();
      } else {
        Log.error(TAG, 'require permission failed');
      }
    }).catch((err) => {
      Log.error(TAG, 'data:' + JSON.stringify(err));
    });
  } catch (err) {
    Log.error(`catch err->${JSON.stringify(err)}`);
  }
}