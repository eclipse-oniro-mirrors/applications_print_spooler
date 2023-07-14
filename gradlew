#
# Copyright (c) 2023-2023 Huawei Device Co., Ltd.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

echo "HM_SDK_HOME is ${HM_SDK_HOME}"
echo "OHOS_SDK_HOME is ${OHOS_SDK_HOME}"
echo "OHOS_BASE_SDK_HOME is ${OHOS_BASE_SDK_HOME}"
export NODE_HOME=/opt/buildtools/Node.js_14.18.3
export PATH=/root/tools/command-line-tools/ohpm/bin:$NODE_HOME/bin:$PATH

sudo apt-get install git-lfs
cd open_source/cups/src
git lfs pull
tar -zxvf cups-2.4.0-source.tar.gz
cd ../../../

# 前置条件，docker镜像或服务器上已安装nodejs、npm、sdk等工具且配置好环境变量和.npmrc文件等
echo ${NODE_HOME}
node -v
npm -v

# 初始化相关路径
APP_HOME="`pwd - P`"
PROJECT_PATH="`pwd -P`"  # 工程目录
TOOLS_INSTALL_DIR="$PROJECT_PATH/commandline-tools_sysdef1"  # commandline-tools安装目录，流水线下载命令行工具的安装路径

if [ ! -d $TOOLS_INSTALL_DIR ]; then
  mkdir $TOOLS_INSTALL_DIR
fi

function init_ohpm
{
    # 下载
    cd ${TOOLS_INSTALL_DIR}
    commandlineVersion=2.0.1.0
    wget --no-check-certificate -q "https://cmc-szver-artifactory.cmc.tools.huawei.com/artifactory/cmc-software-release/DevEco%20Developer%20Suite/deveco-studio-command-line-tools/${commandlineVersion}/ohcommandline-tools-linux-${commandlineVersion}.zip?_t=$(date +%s)" -O ohcommandline-tools-linux.zip
    unzip -oq ohcommandline-tools-linux.zip

    npm config set registry http://mirrors.tools.huawei.com/npm/
    npm config set @ohos:registry https://cmc.centralrepo.rnd.huawei.com/artifactory/api/npm/product_npm/

    # 初始化
    OHPM_HOME=${TOOLS_INSTALL_DIR}/oh-command-line-tools/ohpm
    ${OHPM_HOME}/bin/init
    export PATH=${OHPM_HOME}/bin:${PATH}
    ohpm -v

    # 配置仓库地址
    ohpm config set registry https://cmc.centralrepo.rnd.huawei.com/artifactory/api/npm/product_npm/,http://mirrors.tools.huawei.com/npm/
    # ohpm config set @hw-penengine:registry https://cmc.centralrepo.rnd.huawei.com/artifactory/api/npm/product_npm/
    ohpm config set strict_ssl false
}

init_ohpm

function ohpm_install {
    cd  $1
    ohpm install
}

ohpm_install "$APP_HOME"
ohpm_install "$APP_HOME/common"
ohpm_install "$APP_HOME/feature/ippPrint"
ohpm_install "$APP_HOME/entry"

cd $APP_HOME
echo "sdk.dir=${HM_SDK_HOME}"  > ./local.properties
echo "nodejs.dir=/opt/buildtools/Node.js_14.18.3" >> ./local.properties

npm config set lockfile=false
ls /root/.hvigor/project_caches
rm -rf /root/.hvigor/project_caches
./hvigorw clean assembleHap --mode module -p product=default -p debuggable=false