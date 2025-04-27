// github-api.js - 衛教影片網站GitHub API處理JavaScript文件
// 負責資料的儲存和讀取

// GitHub API 處理模組
const GitHubAPI = (function() {
    // 私有變數
    let token = '';
    let owner = '';
    let repo = '';
    
    // 私有方法 - 從localStorage獲取設定
    const loadConfig = function() {
        token = localStorage.getItem('github_token') || '';
        owner = localStorage.getItem('github_owner') || '';
        repo = localStorage.getItem('github_repo') || '';
    };
    
    // 初始化 - 載入設定
    loadConfig();
    
    // 公開方法
    return {
        // 設置配置
        setConfig: function(newToken, newOwner, newRepo) {
            token = newToken;
            owner = newOwner;
            repo = newRepo;
        },
        
        // 保存配置到localStorage
        saveConfig: function() {
            localStorage.setItem('github_token', token);
            localStorage.setItem('github_owner', owner);
            localStorage.setItem('github_repo', repo);
        },
        
        // 檢查是否已有Token
        hasToken: function() {
            return !!token && !!owner && !!repo;
        },
        
        // 測試配置是否有效
        testConfig: async function() {
            try {
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (response.status === 200) {
                    return true;
                }
                
                return false;
            } catch (error) {
                console.error('測試GitHub配置失敗:', error);
                return false;
            }
        },
        
        // 獲取文件內容
        getFileContent: async function(path) {
            try {
                // 先檢查文件是否存在
                const contentResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (contentResponse.status === 404) {
                    // 文件不存在，返回空數據
                    return null;
                }
                
                if (!contentResponse.ok) {
                    throw new Error(`GitHub API錯誤: ${contentResponse.status}`);
                }
                
                const contentData = await contentResponse.json();
                
                // 解碼base64內容
                const content = atob(contentData.content);
                return {
                    content: content,
                    sha: contentData.sha
                };
            } catch (error) {
                console.error(`獲取文件內容失敗 (${path}):`, error);
                throw error;
            }
        },
        
        // 創建或更新文件
        createOrUpdateFile: async function(path, content, message = 'Update file') {
            try {
                // 先檢查文件是否已存在
                let sha = null;
                try {
                    const fileData = await this.getFileContent(path);
                    if (fileData) {
                        sha = fileData.sha;
                    }
                } catch (error) {
                    // 忽略錯誤，假設文件不存在
                }
                
                // 準備請求數據
                const requestData = {
                    message: message,
                    content: btoa(content),
                    committer: {
                        name: 'Health Education Videos Bot',
                        email: 'bot@example.com'
                    }
                };
                
                // 如果文件已存在，添加sha
                if (sha) {
                    requestData.sha = sha;
                }
                
                // 發送請求
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`GitHub API錯誤: ${response.status} - ${errorData.message}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`創建或更新文件失敗 (${path}):`, error);
                throw error;
            }
        },
        
        // 確保數據目錄存在
        ensureDataDir: async function() {
            try {
                // 檢查data目錄是否存在
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (response.status === 404) {
                    // 創建data目錄（通過創建一個.gitkeep文件）
                    await this.createOrUpdateFile('data/.gitkeep', '', 'Create data directory');
                }
            } catch (error) {
                console.error('確保數據目錄存在失敗:', error);
                throw error;
            }
        },
        
        // 獲取主題列表
        getTopics: async function() {
            try {
                await this.ensureDataDir();
                
                const fileData = await this.getFileContent('data/topics.json');
                
                if (!fileData) {
                    // 文件不存在，創建默認主題
                    const defaultTopics = Array(30).fill().map((_, i) => ({
                        id: i + 1,
                        title: `衛教主題 ${i + 1}`,
                        videoUrl: ''
                    }));
                    
                    // 保存默認主題
                    await this.saveTopics(defaultTopics);
                    
                    return defaultTopics;
                }
                
                return JSON.parse(fileData.content);
            } catch (error) {
                console.error('獲取主題列表失敗:', error);
                throw error;
            }
        },
        
        // 保存主題列表
        saveTopics: async function(topics) {
            try {
                await this.ensureDataDir();
                
                // 確保每個主題都有ID
                topics.forEach((topic, index) => {
                    topic.id = index + 1;
                });
                
                await this.createOrUpdateFile(
                    'data/topics.json', 
                    JSON.stringify(topics, null, 2),
                    '更新衛教主題列表'
                );
                
                return true;
            } catch (error) {
                console.error('保存主題列表失敗:', error);
                throw error;
            }
        },
        
        // 獲取問卷列表
        getQuestionnaires: async function() {
            try {
                await this.ensureDataDir();
                
                const fileData = await this.getFileContent('data/questionnaires.json');
                
                if (!fileData) {
                    // 文件不存在，創建空列表
                    await this.createOrUpdateFile(
                        'data/questionnaires.json', 
                        '[]',
                        '創建問卷列表'
                    );
                    
                    return [];
                }
                
                return JSON.parse(fileData.content);
            } catch (error) {
                console.error('獲取問卷列表失敗:', error);
                throw error;
            }
        },
        
        // 保存問卷列表
        saveQuestionnaires: async function(questionnaires) {
            try {
                await this.ensureDataDir();
                
                await this.createOrUpdateFile(
                    'data/questionnaires.json', 
                    JSON.stringify(questionnaires, null, 2),
                    '更新問卷列表'
                );
                
                return true;
            } catch (error) {
                console.error('保存問卷列表失敗:', error);
                throw error;
            }
        },
        
        // 獲取所有結果
        getAllResults: async function() {
            try {
                await this.ensureDataDir();
                
                const fileData = await this.getFileContent('data/results.json');
                
                if (!fileData) {
                    // 文件不存在，創建空列表
                    await this.createOrUpdateFile(
                        'data/results.json', 
                        '[]',
                        '創建結果列表'
                    );
                    
                    return [];
                }
                
                return JSON.parse(fileData.content);
            } catch (error) {
                console.error('獲取所有結果失敗:', error);
                throw error;
            }
        },
        
        // 保存所有結果
        saveAllResults: async function(results) {
            try {
                await this.ensureDataDir();
                
                await this.createOrUpdateFile(
                    'data/results.json', 
                    JSON.stringify(results, null, 2),
                    '更新結果列表'
                );
                
                return true;
            } catch (error) {
                console.error('保存所有結果失敗:', error);
                throw error;
            }
        },
        
        // 添加單個結果
        saveResult: async function(result) {
            try {
                // 獲取所有結果
                const allResults = await this.getAllResults();
                
                // 添加新結果
                allResults.push(result);
                
                // 保存所有結果
                await this.saveAllResults(allResults);
                
                return true;
            } catch (error) {
                console.error('保存結果失敗:', error);
                throw error;
            }
        },
        
        // 獲取設定
        getSettings: async function() {
            try {
                await this.ensureDataDir();
                
                const fileData = await this.getFileContent('data/settings.json');
                
                if (!fileData) {
                    // 文件不存在，創建默認設定
                    const defaultSettings = {
                        nurseEmails: [],
                        emailFrom: '',
                        emailSecureToken: ''
                    };
                    
                    // 保存默認設定
                    await this.createOrUpdateFile(
                        'data/settings.json', 
                        JSON.stringify(defaultSettings, null, 2),
                        '創建默認設定'
                    );
                    
                    return defaultSettings;
                }
                
                return JSON.parse(fileData.content);
            } catch (error) {
                console.error('獲取設定失敗:', error);
                throw error;
            }
        },
        
        // 保存設定
        saveSettings: async function(settings) {
            try {
                await this.ensureDataDir();
                
                await this.createOrUpdateFile(
                    'data/settings.json', 
                    JSON.stringify(settings, null, 2),
                    '更新設定'
                );
                
                return true;
            } catch (error) {
                console.error('保存設定失敗:', error);
                throw error;
            }
        }
    };
})();