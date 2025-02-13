document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('messageInput');
  const saveButton = document.getElementById('saveButton');
  const messageList = document.getElementById('messageList');
  const appIdInput = document.getElementById('appId');
  const appSecretInput = document.getElementById('appSecret');
  const apiUrlInput = document.getElementById('apiUrl');
  const saveConfigButton = document.getElementById('saveConfig');
  const feishuUrlInput = document.getElementById('feishuUrl');
  const baseIdSpan = document.getElementById('baseId');
  const tableIdSpan = document.getElementById('tableId');
  const saveFeishuIdsButton = document.getElementById('saveFeishuIds');

  // 监听飞书URL输入变化
  feishuUrlInput.addEventListener('input', () => {
    const url = feishuUrlInput.value.trim();
    const baseMatch = url.match(/base\/([^?]+)/);
    const tableMatch = url.match(/table=([^&]+)/);

    baseIdSpan.textContent = baseMatch ? baseMatch[1] : '-';
    tableIdSpan.textContent = tableMatch ? tableMatch[1] : '-';

    const baseId = baseIdSpan.textContent;
    const tableId = tableIdSpan.textContent;


    const feishuIds = {
      baseId,
      tableId
    };
    chrome.storage.local.set({ feishuIds: feishuIds });
    // 保存当前输入的URL
    chrome.storage.local.set({ feishuUrl: url });

    
  });

  // 加载配置
  loadConfig();
  // 加载已保存的飞书URL
  loadFeishuUrl();



  // 保存配置按钮点击事件
  saveConfigButton.addEventListener('click', () => {
    const config = {
      appId: appIdInput.value.trim(),
      appSecret: appSecretInput.value.trim(),
      apiUrl: apiUrlInput.value.trim()
    };
    
    chrome.storage.local.set({ config }, () => {
      alert('配置已保存');
    });
  });

  // 加载配置
  function loadConfig() {
    chrome.storage.local.get(['config'], (result) => {
      if (result.config) {
        appIdInput.value = result.config.appId || '';
        appSecretInput.value = result.config.appSecret || '';
        apiUrlInput.value = result.config.apiUrl || '';
      }
    });
  }

  // 加载已保存的飞书URL
  function loadFeishuUrl() {
    chrome.storage.local.get(['feishuUrl'], (result) => {
      if (result.feishuUrl) {
        feishuUrlInput.value = result.feishuUrl;
        // 触发input事件以更新解析结果
        const event = new Event('input');
        feishuUrlInput.dispatchEvent(event);
      }
    });
  }

  // 保存按钮点击事件
  saveButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
      saveMessage(message);
      messageInput.value = '';
    }
  });

  // 按回车键保存
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveButton.click();
    }
  });



  // 保存飞书ID按钮点击事件
  saveFeishuIdsButton.addEventListener('click', () => {
    const baseId = baseIdSpan.textContent;
    const tableId = tableIdSpan.textContent;

    if (baseId === '-' || tableId === '-') {
      alert('请先输入有效的飞书URL');
      return;
    }

    const feishuIds = {
      baseId,
      tableId
    };
    chrome.storage.local.set({ feishuIds: feishuIds });
   
  });

  // 加载已保存的飞书ID
  chrome.storage.local.get(['feishuIds'], (result) => {
    if (result.feishuIds) {
      baseIdSpan.textContent = result.feishuIds.baseId;
      tableIdSpan.textContent = result.feishuIds.tableId;
    }
  });
});