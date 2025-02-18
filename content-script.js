

// 获取飞书租户访问令牌
async function getTenantAccessToken() {
    try {
        // 通过消息传递机制与background script通信
        const response = await chrome.runtime.sendMessage({ type: 'GET_TENANT_TOKEN' });

        if (!response.success) {
            throw new Error(response.error || '获取租户访问令牌失败');
        }

        return response.data;
    } catch (error) {
        console.error('获取租户访问令牌失败:', error);
        throw error;
    }
}

// 创建飞书多维表格记录
async function createBitableRecord(fields) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'CREATE_BITABLE_RECORD',
            fields
        });

        if (!response.success) {
            throw new Error(response.error || '创建记录失败');
        }

        return response.data;
    } catch (error) {
        console.error('创建记录失败:', error);
        throw error;
    }
}

(() => {
    console.log('开始获取 feishuIds 配置信息...');
    // 获取并显示 feishuIds 配置信息


    // 检查 chrome 对象是否存在
    if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        console.log('Chrome API 尚未加载完成，等待重试...');
        // chrome 扩展 API 尚未加载完成
        setTimeout(arguments.callee, 100);
        return;
    }

    console.log('开始准备创建记录...');


    chrome.runtime.sendMessage({ action: 'getFeishuIds' }, (response) => {
        if (response.feishuIds) {
            console.log('获取到的飞书ID:', response.feishuIds);
            // 在这里处理获取到的飞书ID数据
        }
    });
    if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        // chrome 扩展 API 尚未加载完成
        setTimeout(arguments.callee, 100);
        return;
    }


    const article = new Readability(document.cloneNode(true)).parse();
    const content = article.textContent.replace(
        /\s{2,}/g,
        ' ',
    );


    // 获取当前页面URL和标题
    const fields =
    {
        '内容': content,
        'URL': {
            'link': window.location.href,
            'text': window.location.href
        }
    };

    console.log('准备提交的字段数据:', fields);
    // 创建记录
    createBitableRecord(fields)
        .then(data => {
            console.log('成功创建记录:', data);
        })
        .catch(error => {
            console.error('操作失败:', error);
        });
})();
