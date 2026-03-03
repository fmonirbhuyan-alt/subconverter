<template>
  <div>
    <el-row style="margin-top: 10px">
      <el-col>
        <el-card>
          <div slot="header">
            Digital Freedom Subscription Converter
            <svg-icon icon-class="github" style="margin-left: 20px" @click="goToProject" />

            <div style="display: inline-block; position:absolute; right: 20px; font-weight: bold; color: #409EFF;">{{ backendVersion }} Advanced</div>
          </div>
          <el-container>
            <el-form :model="form" label-width="140px" label-position="left" style="width: 100%">
              <el-form-item label="Mode Setting:">
                <el-radio v-model="advanced" label="1">Basic Mode</el-radio>
                <el-radio v-model="advanced" label="2">Advanced Mode</el-radio>
              </el-form-item>
              <el-form-item label="Sub Link:">
                <el-input v-model="form.sourceSubUrl" type="textarea" rows="3"
                  placeholder="" @blur="saveSubUrl" />
              </el-form-item>

              <el-form-item label="Node Scan:">
                <el-button type="primary" icon="el-icon-search" @click="scanNodes" :loading="scanLoading">Scan Now</el-button>
<<<<<<< HEAD
=======
                <el-button v-if="advanced === '2'" type="info" icon="el-icon-user" @click="handleViewUser" :loading="syncLoading">View User</el-button>
>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
              </el-form-item>

              <div v-if="form.scannedNodes.length > 0 || form.scannedGroups.length > 0" style="margin-bottom: 20px;">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-card class="box-card" shadow="never" style="height: 400px; overflow-y: auto;">
                      <div slot="header" class="clearfix">
                        <span>Scan Results</span>
                      </div>
                      
<<<<<<< HEAD
                      <div v-if="form.scannedGroups.length > 0">
=======
                      <!-- Detected Groups hidden as per user request to only show nodes -->
                      <div v-if="false && form.scannedGroups.length > 0">
>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
                        <div style="font-size: 14px; font-weight: bold; padding: 5px; color: #67C23A; border-bottom: 1px solid #eee;">Detected Groups</div>
                        <div v-for="(group, index) in form.scannedGroups" :key="'g'+index" class="text item" style="margin-bottom: 5px; display: flex; align-items: center;">
                          <el-button type="text" icon="el-icon-plus" @click="addToGlobalFind(group)" style="padding: 0; color: #67C23A;" title="Add to Global Find"></el-button>
                          <span style="font-size: 12px; margin-left: 5px;">{{ group }}</span>
                        </div>
                      </div>

                      <div v-if="form.scannedNodes.length > 0" style="margin-top: 15px;">
                        <div style="font-size: 14px; font-weight: bold; padding: 5px; color: #409EFF; border-bottom: 1px solid #eee;">Server Nodes ({{ form.scannedNodes.length }})</div>
                        <div v-for="(node, index) in form.scannedNodes" :key="'n'+index" class="text item" style="margin-bottom: 5px;">
                          <el-button type="text" icon="el-icon-plus" @click="addToFind(node)" style="padding: 0; margin-right: 5px;" title="Add to Proxy Rename"></el-button>
                          <el-button type="text" icon="el-icon-minus" @click="addToExclude(node)" style="padding: 0; margin-right: 5px; color: #F56C6C;" title="Exclude Node"></el-button>
                          <span style="font-size: 12px;">{{ node }}</span>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <div style="font-weight: bold; margin-bottom: 10px; font-size: 13px; color: #606266;">Node Rename (Proxies)</div>
<<<<<<< HEAD
                    <el-input type="textarea" :rows="8" v-model="form.findValue" placeholder="Names (e.g. 美国1)"></el-input>
                    <el-input v-model="form.replaceValue" placeholder="Replace with..." style="margin-top: 5px;"></el-input>
                  </el-col>
                  <el-col :span="8">
                    <div style="font-weight: bold; margin-bottom: 10px; font-size: 13px; color: #67C23A;">Global Rename (Groups/Text)</div>
                    <el-input type="textarea" :rows="8" v-model="form.globalFindValue" placeholder="Groups (e.g. 自动选择)"></el-input>
                    <el-input v-model="form.globalReplaceValue" placeholder="Replace with..." style="margin-top: 5px;"></el-input>
=======
                    <el-input type="textarea" :rows="8" v-model="form.findValue" placeholder=""></el-input>
                    <el-select v-model="form.replaceValue" allow-create filterable placeholder="Select or Type" style="width: 100%; margin-top: 5px;">
                      <el-option label="Digital Freedom" value="Digital Freedom"></el-option>
                      <el-option label="DF" value="DF"></el-option>
                    </el-select>
                  </el-col>
                  <el-col :span="8">
                    <div style="font-weight: bold; margin-bottom: 10px; font-size: 13px; color: #67C23A;">Global Rename (Groups/Text)</div>
                    <el-input type="textarea" :rows="8" v-model="form.globalFindValue" placeholder=""></el-input>
                    <el-select v-model="form.globalReplaceValue" allow-create filterable placeholder="Select or Type" style="width: 100%; margin-top: 5px;">
                      <el-option label="Digital Freedom" value="Digital Freedom"></el-option>
                      <el-option label="DF" value="DF"></el-option>
                    </el-select>
>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
                  </el-col>
                </el-row>
              </div>
              <el-form-item label="Client:">
                <el-select v-model="form.clientType" style="width: 100%">
                  <el-option v-for="(v, k) in options.clientTypes" :key="k" :label="k" :value="v"></el-option>
                </el-select>
              </el-form-item>

              <div v-if="advanced === '2'">
                <el-form-item label="Backend:">
                  <el-autocomplete style="width: 100%" v-model="form.customBackend" :fetch-suggestions="backendSearch"
                    placeholder="">
                    <el-button slot="append" @click="gotoGayhub" icon="el-icon-link">Repository</el-button>
                  </el-autocomplete>
                </el-form-item>
                <el-form-item label="Remote Config:">
                  <el-select v-model="form.remoteConfig" allow-create filterable placeholder="Select config" style="width: 100%">
                    <el-option-group v-for="group in options.remoteConfig" :key="group.label" :label="group.label">
                      <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                    </el-option-group>
                    <el-button slot="append" @click="gotoRemoteConfig" icon="el-icon-link">Example</el-button>
                  </el-select>
                </el-form-item>
                <el-form-item label="Include:">
                  <el-input v-model="form.includeRemarks" placeholder="" />
                </el-form-item>
                <el-form-item label="Exclude:">
                  <el-input v-model="form.excludeRemarks" placeholder="" />
                </el-form-item>
                <el-form-item label="FileName:">
                  <el-input v-model="form.filename" placeholder="" />
                </el-form-item>

                 <el-form-item v-for="(param, i) in customParams" :key="i">
                  <el-input slot="label" v-model="param.name" placeholder="">
                    <div slot="suffix" style="width: 10px;">:</div>
                  </el-input>
                  <el-input v-model="param.value" placeholder="Param Value">
                      <el-button slot="suffix" type="text" icon="el-icon-delete" style="margin-right: 5px" @click="customParams.splice(i, 1)"/>
                  </el-input>
                </el-form-item>

                <el-form-item label-width="0px">
                  <el-row type="flex">
                    <el-col>
                      <el-checkbox v-model="form.nodeList" label="Output As Node List" border></el-checkbox>
                    </el-col>
                    <el-col>
                      <el-checkbox v-model="form.devLock" label="Device Lock (Single Device)" border></el-checkbox>
                    </el-col>
                    <el-popover placement="bottom" v-model="form.extraset">
                      <el-row>
                        <el-checkbox v-model="form.emoji" label="Emoji"></el-checkbox>
                      </el-row>
                       <el-row>
                        <el-checkbox v-model="form.scv" label="Skip Cert Verify"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.udp" @change="needUdp = true" label="Enable UDP"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.appendType" label="Node Type"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.sort" label="Sort Nodes"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.fdn" label="Filter Nodes"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.fpg" label="Filter Groups"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.expand" label="Rule Expand"></el-checkbox>
                      </el-row>
                      <el-button slot="reference">More Options</el-button>
                    </el-popover>
                    <el-popover placement="bottom" style="margin-left: 10px">
                      <el-row>
                        <el-checkbox v-model="form.tpl.surge.doh" label="Surge.DoH"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.tpl.clash.doh" label="Clash.DoH"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.insert" label="NetEase Music"></el-checkbox>
                      </el-row>
                      <el-button slot="reference">Custom Features</el-button>
                    </el-popover>
                    <el-popover placement="top-end" title="Add Custom Backend Parameter" trigger="hover">
                      <el-link type="primary" :href="subDocAdvanced" target="_blank" icon="el-icon-info">Docs</el-link>
                      <el-button slot="reference" @click="addCustomParam" style="margin-left: 10px">
                        <i class="el-icon-plus"></i>
                      </el-button>
                    </el-popover>
                  </el-row>
                </el-form-item>
              </div>

              <div style="margin-top: 50px"></div>

              <el-divider content-position="center">
                <i class="el-icon-magic-stick"></i>
              </el-divider>

               <el-form-item label="Custom Sub:">
                <el-input class="copy-content" disabled v-model="customSubUrl">
                  <el-button slot="append" v-clipboard:copy="customSubUrl" v-clipboard:success="onCopy" ref="copy-btn"
                    icon="el-icon-document-copy">Copy</el-button>
                </el-input>
              </el-form-item>
              <el-form-item label="Short Link:">
                <el-input class="copy-content" disabled v-model="customShortSubUrl">
                  <el-button slot="append" @click="showQrCode" icon="el-icon-full-screen">QR Code</el-button>
                  <el-button slot="append" v-clipboard:copy="customShortSubUrl" v-clipboard:success="onCopy"
                    ref="copy-btn" icon="el-icon-document-copy">Copy</el-button>
                </el-input>
              </el-form-item>

              <!-- 操作按钮组 -->
              <el-form-item label-width="0px" style="margin-top: 40px; text-align: center">
                <el-button
                  :style="buttonStyle"
                  type="danger"
                  @click="makeUrlClick"
                  :disabled="!canGenerateUrl">
                  Generate Link
                </el-button>
                <el-button
                  :style="buttonStyle"
                  type="danger"
                  @click="makeShortUrlClick"
                  :loading="loading"
                  :disabled="!canGenerateShortUrl">
                  Generate Short Link
                </el-button>
              </el-form-item>

              <el-form-item label-width="0px" style="text-align: center">
                <el-button
                  :style="buttonStyle"
                  type="primary"
                  @click="dialogUploadConfigVisible = true"
                  icon="el-icon-upload"
                  :loading="loading">
                  Upload Config
                </el-button>
                <el-button
                  :style="buttonStyle"
                  type="primary"
                  @click="clashInstall"
                  icon="el-icon-connection"
                  :disabled="!canImportClash">
                  Import to Clash
                </el-button>
              </el-form-item>

              <el-form-item label-width="0px" style="text-align: center">
                <el-button
                  :style="{ width: '290px' }"
                  type="primary"
                  @click="dialogLoadConfigVisible = true"
                  icon="el-icon-copy-document"
                  :loading="loading">
                  Parse from URL
                </el-button>
              </el-form-item>
            </el-form>
          </el-container>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置上传对话框 -->
    <ConfigUploadDialog
      :visible="dialogUploadConfigVisible"
      :upload-config="uploadConfig"
      :loading="loading"
      @cancel="handleUploadCancel"
      @confirm="handleConfigUpload"
    />

    <!-- URL解析对话框 -->
    <UrlParseDialog
      :visible="dialogLoadConfigVisible"
      :load-config="loadConfig"
      :loading="loading"
      @cancel="handleLoadCancel"
      @confirm="handleUrlParse"
    />

    <!-- QR Code 对话框 -->
    <el-dialog :visible.sync="dialogQrCodeVisible" width="350px" center>
      <div slot="title" style="text-align: center;">
        <span style="font-size: 18px; font-weight: bold;">Scan QR Code</span>
        <div style="font-size: 14px; color: #409EFF; margin-top: 5px;">Digital Freedom</div>
      </div>
      <div style="text-align: center">
        <img :src="qrCodeUrl" alt="QR Code" style="max-width: 100%; height: auto; border: 1px solid #eee; padding: 10px; border-radius: 8px;" />
        <p style="margin-top: 15px; font-size: 13px; color: #666;">Scan with Shadowrocket or other VPN apps</p>
        
        <div style="margin-top: 15px; color: #F56C6C; font-weight: bold; font-size: 14px;">
           <i class="el-icon-warning"></i> Don't Break The Rules
        </div>
        
        <div style="margin-top: 5px; font-size: 10px; color: #999;">
          * Non-refundable policy applies
        </div>

        <el-button 
          type="primary" 
          size="small" 
          icon="el-icon-download" 
          style="margin-top: 20px; width: 80%;"
          @click="downloadQrCode">
          Download QR Code
        </el-button>
      </div>
    </el-dialog>
    <!-- View User Dialog -->
    <el-dialog :visible.sync="dialogUserListVisible" width="98%" top="2vh" custom-class="user-mgmt-dialog">
      <div slot="title" style="display: flex; align-items: center; justify-content: space-between; padding-right: 40px;">
        <span style="font-weight: bold; font-size: 18px; color: #409EFF;">
           <i class="el-icon-user-solid"></i> User Management (Direct Access)
        </span>
        <div style="display: flex; align-items: center;">
          <el-tag size="small" type="success" effect="dark" style="margin-right: 15px;">TOTAL: {{ adminUserList.length }}</el-tag>
          <el-button type="primary" size="mini" @click="fetchUserList" :loading="syncLoading" icon="el-icon-refresh">Sync Now</el-button>
        </div>
      </div>

      <div class="user-table-container">
        <!-- Manual Loading Indicator if syncLoading is true -->
        <div v-if="syncLoading" class="sync-overlay">
           <i class="el-icon-loading"></i> Syncing Data...
        </div>

        <table v-if="adminUserList.length > 0" class="pure-excel-table">
          <thead>
            <tr>
              <th width="40">#</th>
              <th width="140">File Name</th>
              <th width="60">Lock</th>
              <th width="140">Created At</th>
              <th>Main Link (Source)</th>
              <th width="80">Short ID</th>
              <th width="80">Status</th>
              <th width="170">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in adminUserList" :key="row.id">
              <td class="center">{{ index + 1 }}</td>
              <td class="filename">{{ row.filename || 'N/A' }}</td>
              <td class="center">
                <span class="lock-tag" :class="{ locked: row.dev_lock }">
                  {{ row.dev_lock ? 'YES' : 'NO' }}
                </span>
              </td>
              <td>{{ formatDate(row.created_at) }}</td>
              <td class="link-cell">
                <div class="url-text" @click="copySourceUrl(row)" title="Click to Copy Original Link">
                  {{ row.source_url || row.url }}
                </div>
              </td>
              <td class="center">
                <span class="short-id" @click="copyUserUrl(row)">{{ row.id }}</span>
              </td>
              <td class="center">
                <span class="status-tag" :class="{ blocked: row.blocked }">
                  {{ row.blocked ? 'Demo Config' : 'Real Config' }}
                </span>
              </td>
              <td class="center actions-cell">
                <button class="btn btn-warn" @click="handleToggleBlock(row)">
                  {{ row.blocked ? 'Back to Normal Config' : 'Redirect to Demo Config' }}
                </button>
                <button class="btn btn-danger" @click="handleDeleteUser(row)">
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="adminUserList.length === 0 && !syncLoading" class="empty-state">
           <i class="el-icon-warning-outline"></i>
           <p>No user data found in storage. (Count: {{ adminUserList.length }})</p>
           <el-button type="primary" size="small" @click="fetchUserList">Force Refresh</el-button>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogUserListVisible = false">Close Management Panel</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 导入配置
import { CONSTANTS } from '@/config/constants';
import { CLIENT_TYPES } from '@/config/client-types';
import { REMOTE_CONFIGS } from '@/config/remote-configs';

// 导入Composables
import { useSubscriptionForm, addCustomParam, saveSubUrl as saveSubscriptionUrl } from '@/composables/useSubscriptionForm';
import { useSubscription } from '@/composables/useSubscription';
import { useUrlParser } from '@/composables/useUrlParser';

// 导入工具函数
import { getLocalStorageItem } from '@/utils/storage';

// 导入服务
import { BackendService } from '@/services/backendService';
import { ShortUrlService } from '@/services/shortUrlService';
import { ConfigUploadService } from '@/services/configUploadService';

// 导入组件
import ConfigUploadDialog from '@/components/ConfigUploadDialog.vue';
import UrlParseDialog from '@/components/UrlParseDialog.vue';

export default {
  name: 'Subconverter',
  components: {
    ConfigUploadDialog,
    UrlParseDialog
  },
  data() {
    const subscriptionForm = useSubscriptionForm();

    return {
      // 配置选项
      options: {
        clientTypes: CLIENT_TYPES,
        backendOptions: [
          { value: "http://192.168.31.222:8888/sub?" },
          { value: "http://127.0.0.1:8888/sub?" },
          { value: "https://api.v1.mk/sub?" },
          { value: "https://sub.xeton.dev/sub?" },
          { value: "https://sub.id9.cc/sub?" },
          { value: "http://127.0.0.1:25500/sub?" }
        ],
        remoteConfig: REMOTE_CONFIGS
      },

      // 状态
      backendVersion: "",
      loading: false,
      scanLoading: false,
<<<<<<< HEAD
      curtomShortSubUrl: "",
=======
      customShortSubUrl: "",
>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
      dialogUploadConfigVisible: false,
      loadConfig: "",
      dialogLoadConfigVisible: false,
      uploadConfig: "",
      subDocAdvanced: CONSTANTS.DOC_ADVANCED,
      dialogQrCodeVisible: false,
      qrCodeUrl: "",
      
      // User Management
      dialogUserListVisible: false,
      adminUserList: [],
      syncLoading: false,
      adminPassword: "",

      // 是否为 PC 端
      isPC: true,

      // 合并表单状态
      ...subscriptionForm
    };
  },
  computed: {
    // 按钮统一样式
    buttonStyle() {
      return { width: '140px' };
    },

    canGenerateShortUrl() {
      return this.customSubUrl.length > 0 && !this.loading;
    },

    canGenerateUrl() {
      return this.form.sourceSubUrl.length > 0 && this.form.clientType;
    },

    canImportClash() {
      return this.customSubUrl.length > 0;
    },

    processedSubUrl() {
      return this.form.sourceSubUrl.replace(/(\n|\r|\n\r)/g, "|");
    },

    currentBackend() {
      return this.form.customBackend || CONSTANTS.DEFAULT_BACKEND;
    }
  },
  created() {
    document.title = "Subscription Converter";
    this.isPC = this.$getOS().isPc;

    // 获取 url cache
    if (import.meta.env.VITE_USE_STORAGE === 'true') {
      const cachedUrl = getLocalStorageItem('sourceSubUrl');
      if (cachedUrl) {
        this.form.sourceSubUrl = cachedUrl;
      }
    }
  },
  mounted() {
    this.form.clientType = CONSTANTS.DEFAULT_CLIENT_TYPE;
    this.getBackendVersion();
<<<<<<< HEAD
=======
    // 延迟加载隐私提示已经被注释掉，避免弹窗
    // setTimeout(() => {
    //   this.notify();
    // }, 1000);
>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
  },
  methods: {
    onCopy() {
      this.$message.success("Copied!");
    },

    goToProject() {
      window.open(CONSTANTS.PROJECT);
    },

    gotoGayhub() {
      window.open(CONSTANTS.BACKEND_RELEASE);
    },

    gotoRemoteConfig() {
      window.open(CONSTANTS.REMOTE_CONFIG_SAMPLE);
    },

    clashInstall() {
      if (this.customSubUrl === "") {
        this.$message.error("Please fill required fields and generate a sub link first");
        return false;
      }

      const url = "clash://install-config?url=";
      window.open(
        url +
        encodeURIComponent(
          this.customShortSubUrl !== ""
            ? this.customShortSubUrl
            : this.customSubUrl
        )
      );
    },

    makeUrlClick() {
      const url = this.makeUrl(this.form, this.advanced, this.processedSubUrl, this.currentBackend, this.customParams, this.needUdp);
      if (url) {
        console.log(`Generated URL Length: ${url.length}`);
        this.customSubUrl = url;
        this.$copyText(this.customSubUrl);
        this.$message.success(`Custom sub link copied (${url.length} chars)`);
      } else {
        this.$message.error("Subscription link and client are required");
      }
    },

    makeShortUrlClick() {
      if (this.customSubUrl === "") {
        this.$message.warning("Please generate a sub link first");
        return false;
      }

      this.loading = true;
      const sourceUrl = this.form.sourceSubUrl || "";

      ShortUrlService.generateShortUrl(this.$axios, this.customSubUrl, sourceUrl)
        .then(shortUrl => {
          this.customShortSubUrl = shortUrl;
          this.$copyText(shortUrl);
          this.$message.success("Short link copied to clipboard");
        })
        .catch(error => {
          this.$message.error("Short link generation failed: " + error.message);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    scanNodes() {
      if (!this.processedSubUrl) {
        this.$message.warning("Please enter a valid subscription link");
        return false;
      }

      this.scanLoading = true;
      this.form.scannedNodes = [];
      this.form.scannedGroups = [];

      BackendService.getNodes(this.$axios, this.processedSubUrl)
        .then(res => {
          this.form.scannedNodes = res.nodes;
          this.form.scannedGroups = res.groups;
          
          if (res.nodes.length > 0 || res.groups.length > 0) {
            this.$message.success(`Scanned ${res.nodes.length} nodes and ${res.groups.length} groups.`);
<<<<<<< HEAD
=======
            // Automatically apply smart filter if nodes are found
            if (res.nodes.length > 0) {
              this.applySmartFilter(res.nodes);
            }
>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
          } else {
            this.$message.info("No nodes or groups found.");
          }
        })
        .catch(err => {
          this.$message.error("Scan failed: " + err.message);
        })
        .finally(() => {
          this.scanLoading = false;
        });
    },

<<<<<<< HEAD
    smartClean() {
      const junkPatterns = [
        "到期", "GB"
=======
    applySmartFilter(nodes) {
      // Escape special characters and join with | for regex
      const filterRegex = nodes
        .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
      
      if (filterRegex.length > 2500) {
        this.$confirm(
          `The filter list is very long (${filterRegex.length} chars). This may cause "502 Bad Gateway" errors. Work with only the first 50 nodes instead?`,
          'Warning: Long Filter',
          {
            confirmButtonText: 'Yes, Optimize',
            cancelButtonText: 'No, Keep All',
            type: 'warning'
          }
        ).then(() => {
          const optimizedNodes = nodes.slice(0, 50);
          this.applySmartFilter(optimizedNodes);
        }).catch(() => {
          this.form.includeRemarks = filterRegex;
          this.form.fpg = true;
          this.$message.warning("Large filter applied. If you get a 502 error, try selecting fewer nodes.");
        });
        return;
      }

      this.form.includeRemarks = filterRegex;
      this.form.fpg = true; // Ensure Filter Proxy Groups is on
      this.$message({
        message: 'Smart filtering applied: Only scanned nodes will be included.',
        type: 'success',
        duration: 3000
      });
    },

    smartClean() {
      const junkPatterns = [
        "重置", "剩余", "流量", "到期", "GB", "MB", 
        "官网", "更-新", "线路", "bing"
>>>>>>> 62a8b61 (Final live update: Branding, rename presets, user-agent fix, and bundled worker code)
      ];
      
      const regex = `(${junkPatterns.join('|')})`;
      
      if (this.form.excludeRemarks) {
        if (!this.form.excludeRemarks.includes(regex)) {
           this.form.excludeRemarks += "|" + regex;
        }
      } else {
        this.form.excludeRemarks = regex;
      }
      
      this.form.fpg = true; // Auto-enable Filter Proxy Groups
      this.$message.success("Smart Clean applied!");
      
      if (this.form.scannedNodes.length === 0) {
        this.scanNodes();
      }
    },

    addToFind(nodeName) {
      if (this.form.findValue) {
        this.form.findValue += "\n" + nodeName;
      } else {
        this.form.findValue = nodeName;
      }
    },

    addToGlobalFind(name) {
      if (this.form.globalFindValue) {
        this.form.globalFindValue += "\n" + name;
      } else {
        this.form.globalFindValue = name;
      }
    },

    addToExclude(nodeName) {
      // Escape special regex characters to ensure literal matching
      const escapedNodeName = nodeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      if (this.form.excludeRemarks) {
        // Only add if not already present
        const currentExcludes = this.form.excludeRemarks.split('|');
        if (!currentExcludes.includes(escapedNodeName)) {
           this.form.excludeRemarks += "|" + escapedNodeName;
        }
      } else {
        this.form.excludeRemarks = escapedNodeName;
      }
      this.$message.info(`Added "${nodeName}" to Exclude list.`);
    },

    confirmUploadConfig() {
      if (this.uploadConfig === "") {
        this.$message.warning("Remote config cannot be empty");
        return false;
      }

      this.loading = true;

      ConfigUploadService.uploadConfig(this.$axios, this.uploadConfig)
        .then(res => {
          const result = ConfigUploadService.handleUploadSuccess(res, this.$copyText, this.$message);
          if (result.success) {
            // 自动填充至『表单-远程配置』
            this.form.remoteConfig = result.url;
            this.$copyText(this.form.remoteConfig);
            this.dialogUploadConfigVisible = false;
            this.uploadConfig = "";
          }
        })
        .catch(error => {
          this.$message.error("Config upload failed: " + error.message);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    handleUploadCancel() {
      this.uploadConfig = "";
      this.dialogUploadConfigVisible = false;
    },

    handleConfigUpload(configContent) {
      this.uploadConfig = configContent;
      this.confirmUploadConfig();
    },

    handleLoadCancel() {
      this.loadConfig = "";
      this.dialogLoadConfigVisible = false;
    },

    handleUrlParse(url) {
      this.loadConfig = url;
      this.confirmLoadConfig();
    },

    confirmLoadConfig() {
      this.loading = true;

      this.parseUrl(
        this.loadConfig,
        this.form,
        this.customParams,
        () => {
          this.dialogLoadConfigVisible = false;
          this.loadConfig = "";
          this.$message.success("URL parsed successfully");
        },
        (error) => {
          this.$message.error(error);
        }
      ).then(() => {
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },

    backendSearch(queryString, cb) {
      const results = this.backendSearchSuggestions(queryString, this.options.backendOptions);
      cb(results);
    },

    backendSearchSuggestions(queryString, backends) {
      if (queryString) {
        return backends.filter(backend => {
          return backend.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
        });
      }
      return backends;
    },

    async getBackendVersion() {
      this.backendVersion = await BackendService.getBackendVersion(this.$axios);
    },

    notify() {
      const h = this.$createElement;

      this.$notify({
        title: "Privacy Tip",
        type: "warning",
        message: h(
          "i",
          { style: "color: teal" },
          "Subscription link generation is purely client-side (excluding shortlinks), ensuring no privacy issues. We provide a default backend for conversion, but privacy-conscious users are encouraged to deploy their own."
        )
      });
    },

    showQrCode() {
      if (this.customShortSubUrl === "") {
        this.$message.warning("Please generate a short link first");
        return;
      }
      this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.customShortSubUrl)}`;
      this.dialogQrCodeVisible = true;
    },

    async downloadQrCode() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const padding = 20;
        const qrSize = 250;
        const width = qrSize + (padding * 2);
        const height = width + 140; // Extra space for text

        canvas.width = width;
        canvas.height = height;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Header: Digital Freedom (Stylish & Large)
        ctx.shadowColor = 'rgba(64, 158, 255, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = '#409EFF';
        ctx.font = 'bold 26px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Digital Freedom', width / 2, 40);
        
        // Reset Shadow for other text
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.fillStyle = '#555';
        ctx.font = 'italic 14px sans-serif';
        ctx.fillText('Premium Subscription Gateway', width / 2, 65);

        // Load QR Image
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = this.qrCodeUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Draw QR
        ctx.drawImage(img, padding, 80, qrSize, qrSize);

        // Footer 1: Instruction
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.fillText('Scan with Shadowrocket / VPN apps', width / 2, height - 75);

        // Footer 2: Warning
        ctx.fillStyle = '#F56C6C';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Don\'t Break The Rules', width / 2, height - 45);

        // Footer 3: Policy
        ctx.fillStyle = '#999';
        ctx.font = 'italic 10px sans-serif';
        ctx.fillText('* Non-refundable policy applies', width / 2, height - 20);

        // Trigger Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'DigitalFreedom_QR_Secure.png';
        link.click();
        
        this.$message.success("Branded QR Code downloaded!");
      } catch (error) {
        this.$message.error("Download failed: " + error.message);
      }
    },

    // User Management Methods
    handleViewUser() {
      this.$prompt('Please enter Admin Password', 'Security Check', {
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
        inputType: 'password'
      }).then(({ value }) => {
        this.adminPassword = value;
        this.dialogUserListVisible = true;
        this.fetchUserList();
      }).catch(() => {});
    },

    fetchUserList() {
      if (this.syncLoading) return;
      this.syncLoading = true;
      
      console.log("Admin Sync: Fetching list...");

      fetch('/api/admin/list', {
        headers: { 
          'Authorization': this.adminPassword,
          'Accept': 'application/json'
        }
      })
      .then(async response => {
        if (!response.ok) {
           const text = await response.text();
           throw new Error(text || `HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(res => {
        if (Array.isArray(res)) {
          console.log(`Admin Sync: Success, ${res.length} items`);
          // Use sort if needed, but ensure reactivity
          const sorted = res.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          this.adminUserList = sorted;
          if (sorted.length > 0) {
            this.$message.success(`Found ${sorted.length} users`);
          }
        } else {
          this.adminUserList = [];
          console.warn("Unexpected response:", res);
        }
      })
      .catch(err => {
        console.error("Admin Sync Detailed Error:", err);
        this.$message.error("Sync Error: " + err.message);
        if (err.message.includes("401")) this.dialogUserListVisible = false;
      })
      .finally(() => {
        this.syncLoading = false;
        console.log("Admin Sync: Finished");
      });
    },

    handleToggleBlock(row) {
      ShortUrlService.toggleBlock(this.$axios, row.id, this.adminPassword)
        .then(newStatus => {
          row.blocked = newStatus;
          this.$message.success(newStatus ? "Redirected to Demo Config" : "Restored Normal Config");
        })
        .catch(err => {
          this.$message.error("Operation failed: " + err.message);
        });
    },

    handleDeleteUser(row) {
      this.$confirm('Are you sure you want to delete this shortlink?', 'Warning', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        ShortUrlService.deleteShortUrl(this.$axios, row.id, this.adminPassword)
          .then(() => {
            this.$message.success("Shortlink deleted");
            this.fetchUserList();
          })
          .catch(err => {
            this.$message.error("Deletion failed: " + err.message);
          });
      });
    },

    copyUserUrl(row) {
      let shortUrlBase = CONSTANTS.SHORT_URL_BASE || window.location.origin;
      shortUrlBase = shortUrlBase.replace(/\/$/, "");
      const fullUrl = `${shortUrlBase}/${row.id}`;
      this.$copyText(fullUrl);
      this.$message.success("URL copied to clipboard");
    },

    copySourceUrl(row) {
      const url = row.source_url || row.url;
      this.$copyText(url);
      this.$message.success("Original link copied to clipboard");
    },

    handleOpenUrl(url) {
      if (url) window.open(url, '_blank');
    },

    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      const d = new Date(dateStr);
      return d.toLocaleString();
    },

    // 表单相关方法
    saveSubUrl() {
      saveSubscriptionUrl(this.form);
    },

    addCustomParam() {
      addCustomParam(this.customParams);
    },

    // 使用 composables
    ...useSubscription(),
    ...useUrlParser()
  }
};
</script>

<style scoped>
.user-mgmt-dialog :deep(.el-dialog__body) {
  padding: 10px 20px 20px;
}

.user-table-container {
  position: relative;
  min-height: 200px;
  max-height: 650px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.sync-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #409EFF;
  font-weight: bold;
  font-size: 16px;
}

.sync-overlay i {
  font-size: 30px;
  margin-bottom: 10px;
}

.pure-excel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: #606266;
  table-layout: fixed;
}

.pure-excel-table th {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: bold;
  text-align: left;
  padding: 12px 10px;
  border-bottom: 2px solid #ebeef5;
  position: sticky;
  top: 0;
  z-index: 5;
}

.pure-excel-table td {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  word-break: break-all;
  vertical-align: middle;
}

.pure-excel-table tr:hover {
  background-color: #f0f9eb;
}

.center { text-align: center; }

.filename {
  font-weight: 500;
  color: #303133;
}

.lock-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  background: #f4f4f5;
  color: #909399;
}
.lock-tag.locked {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  background: #f0f9eb;
  color: #67c23a;
}
.status-tag.blocked {
  background: #fef0f0;
  color: #f56c6c;
}

.short-id {
  background: #ecf5ff;
  color: #409eff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  border: 1px dashed #409eff;
}
.short-id:hover {
  background: #409eff;
  color: #fff;
}

.url-text {
  color: #409EFF;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  cursor: pointer;
}
.url-text:hover {
  text-decoration: underline;
}

.actions-cell {
  display: flex;
  gap: 5px;
  justify-content: center;
}

.btn {
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: bold;
  transition: all 0.2s;
}
.btn-warn { background: #e6a23c; color: #fff; }
.btn-warn:hover { background: #cf9236; }
.btn-danger { background: #f56c6c; color: #fff; }
.btn-danger:hover { background: #dd6161; }

.empty-state {
  text-align: center;
  padding: 50px;
  color: #909399;
}
.empty-state i {
  font-size: 40px;
  margin-bottom: 10px;
}
</style>
