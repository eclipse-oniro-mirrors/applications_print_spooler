# PrintSpooler<a name="ZH-CN_TOPIC_0000001103330836"></a>

-   [简介](#section11660541593)
    -   [架构图](#section125101832114213)
-   [目录](#section161941989596)
-   [使用说明](#section123459000)
-   [相关仓](#section1371113476307)

## 简介<a name="section11660541593"></a>

PrintSpooler应用是OpenHarmony中预置的系统应用，为用户提供打印预览、发现和连接打印机、打印参数设置、下发打印任务以及打印任务状态的管理等功能。

### 约束限制
当前只支持对接支持ipp无驱动打印协议的打印机，需要单独安装驱动的打印机赞不支持对接。

### 架构图<a name="section125101832114213"></a>

![](figures/spooler_01.png)

## 目录<a name="section161941989596"></a>

```
/applications/standard/print_spooler
    ├── LICENSE                         # 许可文件
    ├── common                          # 通用工具类目录
    ├── entry                           # entry模块目录
    ├── signature                       # 证书文件目录
    ├── features                        # 子组件目录
    │   ├── ippPrint                    # 局域网打印组件   

```
### 

## 基础开发说明
### 资源引用
#### 定义资源文件
- 在 `src/main/resources/`目录下，根据不同的资源类型，定义资源文件。

  ```json
      {
        "name": "default_background_color",
        "value": "#F1F3F5"
      },
  ```
#### 引用资源
- 在有对应page的ets文件中，可直接通过`$r()`引用。
  ```` JavaScript
  @Provide backgroundColor: Resource = $r('app.color.default_background_color');
  ````
## 典型接口的使用
打印框架启动打印界面

   ```
    std::string jobId = GetPrintJobId();
    auto printJob = std::make_shared<PrintJob>();
    if (printJob == nullptr) {
        return E_PRINT_GENERIC_FAILURE;
    }
    printJob->SetFdList(fdList);
    printJob->SetJobId(jobId);
    printJob->SetJobState(PRINT_JOB_PREPARED);
    AAFwk::Want want;
    want.SetElementName(SPOOLER_BUNDLE_NAME, SPOOLER_ABILITY_NAME);
    want.SetParam(LAUNCH_PARAMETER_JOB_ID, jobId);
    want.SetParam(LAUNCH_PARAMETER_FILE_LIST, fileList);
    BuildFDParam(fdList, want);
    int32_t callerTokenId = static_cast<int32_t>(IPCSkeleton::GetCallingTokenID());
    std::string callerPkg = DelayedSingleton<PrintBMSHelper>::GetInstance()->QueryCallerBundleName();
    ingressPackage = callerPkg;
    int32_t callerUid = IPCSkeleton::GetCallingUid();
    int32_t callerPid = IPCSkeleton::GetCallingPid();
    want.SetParam(AAFwk::Want::PARAM_RESV_CALLER_TOKEN, callerTokenId);
    want.SetParam(AAFwk::Want::PARAM_RESV_CALLER_UID, callerUid);
    want.SetParam(AAFwk::Want::PARAM_RESV_CALLER_PID, callerPid);
    want.SetParam(CALLER_PKG_NAME, callerPkg);
    if (!StartAbility(want)) {
        PRINT_HILOGE("Failed to start spooler ability");
        return E_PRINT_SERVER_FAILURE;
    }
   ```
## 签名打包
### 签名
#### 签名文件的获取
1. 拷贝OpenHarmony标准版 工程的 OpenHarmony\signcenter_tool 目录到操作目录
2. 标准版的签名文件下载路径：https://gitee.com/openharmony/signcenter_tool?_from=gitee_search。
3. PrintSpooler 工程的 signature\spooler.p7b 到该目录下
#### 签名文件的配置
打开项目工程，选择 File → Project Structure

![](figures/signature_1.png)

选择Project → Signing Configs，将对应的签名文件配置如下，完成后点击Apply，再点击OK。
密码为生成签名文件时的密码，如果使用默认的签名文件，则使用默认密码123456。

![](figures/signature_2.png)

## 安装、运行、调试
## 应用安装
配置 hdc：
进入SDK目录中的toolchains文件夹下，获取文件路径：

![](figures/screenshot-20210521-105407.png)

> 注意，此处的hdc.exe如果版本较老，可能不能正常使用，需要获取新的hdc.exe文件  
> hdc命令介绍与下载详见：[hdc仓库地址](https://gitee.com/openharmony/developtools_hdc_standard)


并将此路径配置到环境变量中：

![](figures/screenshot-20210521-111223.png)

重启电脑使环境变量生效

连接开发板，打开cmd命令窗口，执行hdc list targets，弹出窗口如下：

![](figures/cmd1.png)

等待一段时间后，窗口出现如下打印，可回到输入 hdc list targets 的命令窗口继续操作:

![](figures/cmd2.png)

再次输入hdc list targets，出现如下结果，说明hdc连接成功

![](figures/cmd3.png)

获取读写权限：

```
hdc target mount 
```
将签名好的 hap 包放入设备的 `/system/app/com.ohos.spooler` 目录下，并修改hap包的权限

```
hdc file send 本地路径 /system/app/com.ohos.spooler/hap包名称
例如：hdc file send Spooler.hap /system/app/com.ohos.spooler/Spooler.hap
```
## 应用运行
Spooler属于系统应用，在将签名的 hap 包放入 `/system/app/com.ohos.spooler` 目录后，重启系统，应用会自动拉起。
```
hdc shell
reboot
（不可以直接执行hdc reboot，命令是无效的)
```
> 注意，如果设备之前安装过系统应用，则需要执行如下两条命令清除设备中存储的应用信息才能够在设备重启的时候将我们装入设备的新 hap 包正常拉起。
> ```
> hdc  shell rm -rf  /data/misc_de/0/mdds/0/default/bundle_manager_service
> hdc  shell rm -rf  /data/accounts
> ```
## 应用调试
### log打印
- 在程序中添加 log
```JS
import hilog from '@ohos.hilog';
hilog.info(0x0001, "Spooler", "%{public}s World %{private}d", "hello", 3);
```
### log获取及过滤
- log获取


将log输出至文件
```
hdc shell hilog > 输出文件名称
```

例：
在真实环境查看log，将全log输出到当前目录的hilog.log文件中
```
hdc shell hilog > hilog.log
```

- log过滤

在命令行窗口中过滤log
```
hilog │ grep 过滤信息
```

例：过滤包含信息 Label 的 hilog
```
hilog │ grep Label
```
## 贡献代码
### Fork 代码仓库
1. 在码云上打开 PrintSpooler 代码仓库（[仓库地址](https://gitee.com/openharmony/applications_print_spooler)）。

2. 点击仓库右上角的 Forked 按钮，在弹出的画面中，选择将仓库 fork 到哪里，点击确认。

3. Fork 成功之后，会在自己的账号下看见 fork 的代码仓库。

### 提交代码
1. 访问我们自己在码云账号上 fork 的代码仓库，点击“克隆/下载”按钮，选择 SSH/HTTPS，点击“复制”按钮。

2. 在本地新建 PrintSpooler 目录，在 PrintSpooler 目录中执行如下命令
   ```
   git clone 步骤1中复制的地址
   ```

3. 修改代码。

   > 将代码引入工程，以及编译工程等相关内容请参见 **3. 代码使用** 部分的相关内容。
4. 提交代码到 fork 仓库。
   > 修改后的代码，首先执行 `git add` 命令，然后执行 `git commit` 命令与 `git push` 命令，将代码 push 到我们自己的 fork 仓中。
   > 关于代码提交的这部分内容涉及 git 的使用，可以参照 [git官网](https://git-scm.com/) 的内容，在此不再赘述。

### 发起 Pull Request (PR)
在将代码提交到 fork 仓之后，我们可以通过发起 Pull Request（PR）的方式来为 OpenHarmony 的相关项目贡献代码。

1. 打开 fork 仓库。选择 `Pull Requests` → `新建 Pull Request`

2. 在 `新建 Pull Request` 画面填入标题与说明，点击 `创建` 按钮。

3. 创建 Pull Request 完成。 PR 创建完成后，会有专门的代码审查人员对代码进行评审，评审通过之后会合入相应的代码库。
