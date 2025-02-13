// 获取飞书租户访问令牌
async function getTenantAccessToken() {
  try {
    // 从 storage 中获取配置
    const result = await chrome.storage.local.get(['config']);
    const config = result.config || {};

    if (!config.appId || !config.appSecret) {
      throw new Error('请先配置 App ID 和 App Secret');
    }

    // 调用飞书接口
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        app_id: config.appId,
        app_secret: config.appSecret
      })
    });

    const data = await response.json();
    console.log('飞书接口返回数据:', data);

    if (data.code !== 0) {
      throw new Error(data.msg || '获取租户访问令牌失败');
    }

    console.log('成功获取租户访问令牌:', data.tenant_access_token);
    console.log('令牌有效期:', data.expire, '秒');

    return data;
  } catch (error) {
    console.error('获取租户访问令牌失败:', error);
    throw error;
  }
}

// 创建飞书多维表格记录
async function createBitableRecord(tenantAccessToken, fields) {
  try {
    // 从 storage 中获取 feishuIds
    const result = await chrome.storage.local.get(['feishuIds']);
    const feishuIds = result.feishuIds || {};
    debugger
    if (!feishuIds.baseId || !feishuIds.tableId) {
      throw new Error('请先配置 Base ID 和 Table ID');
    }

    const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${feishuIds.baseId}/tables/${feishuIds.tableId}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tenantAccessToken}`
      },
      body: JSON.stringify({ fields })
    });

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(data.msg || '创建记录失败');
    }

    return data;
  } catch (error) {
    console.error('创建记录失败:', error);
    throw error;
  }
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TENANT_TOKEN') {
    getTenantAccessToken()
      .then(data => {
        sendResponse({ success: true, data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道开启以支持异步响应
  } else if (request.type === 'CREATE_BITABLE_RECORD') {
    // 处理创建记录的请求
    getTenantAccessToken()
      .then(async tokenData => {
        try {
          const recordData = await createBitableRecord(
            tokenData.tenant_access_token,
            request.fields
          );

          sendResponse({ success: true, data: recordData });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (request.action === 'getFeishuIds') {
    // 从 chrome.storage.local 获取数据
    debugger;
    chrome.storage.local.get(['feishuIds'], (result) => {
      if (result.feishuIds) {
        // 将飞书ID数据传回 content-script.js
        sendResponse({ feishuIds: result.feishuIds });
      } else {
        sendResponse({ feishuIds: null });
      }
    });
    // 需要返回 true 以保持响应通道
    return true;
  }
});