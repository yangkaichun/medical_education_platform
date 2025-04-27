<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>衛教影片網站 README</title>
  <!-- Tailwind CSS 2.2.19 -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <!-- Font Awesome 6.5.2 -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css">
  <!-- Google Fonts: Noto Sans TC -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-tc@3.3.1/index.min.css">
  <style>
    body { font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif; }
    pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; }
    code { color: #8b5cf6; }
    h2 { scroll-margin-top: 5rem; }
    .icon { color: #2563eb; }
    a { color: #2563eb; text-decoration: underline; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900">
  <div class="max-w-3xl mx-auto p-8">
    <header class="mb-8 flex items-center gap-3">
      <i class="fas fa-film fa-2x icon"></i>
      <h1 class="text-3xl font-bold">衛教影片網站</h1>
      <span class="ml-auto text-sm text-gray-400">README</span>
    </header>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2 flex items-center"><i class="fas fa-info-circle mr-2"></i>專案簡介</h2>
      <p>本專案是一套以 GitHub 為後端資料儲存、部署於 GitHub Pages 的衛教影片網站，提供院所衛教師或護理師用於宣導教育影片、調查問卷填答與管理。</p>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li>首頁：用戶掃描 QR Code，選擇主題，觀看影片，填寫問卷</li>
        <li>管理頁：自動統計問卷及顯示結果，護理師通知</li>
        <li>設定頁：可設定影片主題與連結、問卷內容及分數計算</li>
      </ul>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2 flex items-center"><i class="fas fa-play-circle mr-2"></i>主要技術</h2>
      <ul class="list-disc pl-5 space-y-1">
        <li>Tailwind CSS 2.2.19（設計快速高效）</li>
        <li>Font Awesome 6.5.2（圖示）</li>
        <li>Google Fonts Noto Sans TC（中文最佳化字體）</li>
        <li>原生 JS（HTML5 + ES6）</li>
        <li>GitHub API（安全存取與資料存儲）</li>
      </ul>
      <div class="mt-2 text-sm text-gray-600">
        <b>Tips：</b> 建議透過 jsDelivr 取得所有第三方套件以提升載入速度與穩定性。
      </div>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2 flex items-center">
        <i class="fas fa-cloud-upload-alt mr-2"></i>部署步驟
      </h2>
      <ol class="list-decimal pl-5 space-y-2 text-base">
        <li>
          <b>準備 GitHub 帳號與儲存庫：</b>
          <ul class="list-disc pl-5 text-sm">
            <li>前往 <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a> 註冊帳號</li>
            <li>建立新 repository（建議名稱 <code>edu-video-site</code>）</li>
          </ul>
        </li>
        <li>
          <b>啟用 GitHub Pages：</b>
          <ul class="list-disc pl-5 text-sm">
            <li>進入 repo 設定（Settings） &rarr; Pages</li>
            <li>Source 選擇 <b>main branch</b> &amp; <b>/root</b> folder，儲存</li>
            <li>記下公開網址（如：<code>https://yourname.github.io/edu-video-site/</code>）</li>
          </ul>
        </li>
        <li>
          <b>取得 GitHub Personal Access Token：</b>
          <ul class="list-disc pl-5 text-sm">
            <li>進入 <a href="https://github.com/settings/tokens" target="_blank" rel="noopener">GitHub Token 設定頁</a></li>
            <li>點選「Generate new token (classic)」</li>
            <li>
              給予 <code>repo</code> 權限（勾選 <code>repo</code> 全部子項）
            </li>
            <li>產生後複製 Token（僅顯示一次，請保存）</li>
          </ul>
        </li>
        <li>
          <b>下載並上傳程式碼：</b>
          <ul class="list-disc pl-5 text-sm">
            <li>將本專案 HTML/CSS/JS 檔案上傳至 repository 根目錄</li>
            <li>
              主要檔案：
              <ul class="list-decimal pl-5 text-xs">
                <li><code>index.html</code> - 前台首頁</li>
                <li><code>admin.html</code> - 管理頁</li>
                <li><code>settings.html</code> - 設定頁</li>
                <li><code>styles.css</code> - 樣式</li>
                <li><code>main.js</code>、<code>admin.js</code>、<code>settings.js</code> - 各頁功能腳本</li>
                <li><code>github-api.js</code> - GitHub API 操作函式</li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <b>初次設定與測試：</b>
          <ul class="list-disc pl-5 text-sm">
            <li>在 <code>settings.html</code> 進行主題與問卷初始化設定</li>
            <li>填入 GitHub Token 以便存取與更新資料</li>
            <li>首頁 <code>index.html</code> 正常操作後會將資料經 token 安全上傳 repo 設定檔</li>
          </ul>
        </li>
        <li>
          <b>影片與問卷設定說明：</b>
          <ul class="list-disc pl-5 text-sm">
            <li>每個衛教主題皆可編輯標題、影片連結（如 YouTube 或 MP4 直鏈）、問卷題目及每題分數</li>
            <li>問卷支援單/複選題與是非題</li>
            <li>用戶完成觀看影片（無法快轉但可重播）才能進行問卷填寫，以防跳過驗證</li>
          </ul>
        </li>
        <li>
          <b>GitHub API 安全性說明：</b>
          <ul class="list-disc pl-5 text-sm">
            <li>Token 僅在本地儲存 <code>localStorage</code> 並用於 API 呼叫，請勿將 token 直接公開 commit 至專案</li>
            <li>建議定期在 GitHub 更換 Token 以確保安全</li>
          </ul>
        </li>
      </ol>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2 flex items-center"><i class="fas fa-video mr-2"></i>MP4 嵌入最佳實踐</h2>
      <p>
        建議使用以下方式將 MP4 或工具產生的影片嵌入頁面，支援 Chrome/Safari (手機平板亦適用)：
      </p>
      <pre class="text-sm"><code>&lt;video controls playsinline webkit-playsinline class="w-full max-w-md mx-auto"&gt;
  &lt;source src="your_video_url" type="video/mp4"&gt;
&lt;/video&gt;
</code></pre>
      <div class="mt-2 text-gray-600 text-xs">
        <i class="fas fa-exclamation-circle text-yellow-500"></i>
        請勿將大容量影片直接存進 repo，建議使用外部儲存如 Cloud 或網盤得連結。
      </div>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2 flex items-center"><i class="fas fa-chart-bar mr-2"></i>常用第三方資源</h2>
      <ul class="list-disc pl-5 text-base">
        <li>
          <b>Chart.js</b> (數據圖表)：<br>
          <span class="text-sm inline-block bg-gray-100 rounded px-2">https://cdn.jsdelivr.net/npm/<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="0f6c676e7d7b21657c4f3b213b213c">[email&#160;protected]</a>/dist/chart.umd.min.js</span>
        </li>
        <li>
          <b>ECharts</b> (交互圖表)：<br>
          <span class="text-sm inline-block bg-gray-100 rounded px-2">https://cdn.jsdelivr.net/npm/<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="6500060d0417111625504b514b57">[email&#160;protected]</a>/dist/echarts.min.js</span>
        </li>
        <li>
          <b>Font Awesome 圖示：</b><br>
          <span class="text-sm inline-block bg-gray-100 rounded px-2">https://cdn.jsdelivr.net/npm/@fortawesome/<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="1a7c75746e7b6d7f6975777f377c687f7f5a2c342f3428">[email&#160;protected]</a>/css/all.min.css</span>
        </li>
        <li>
          <b>Google Fonts 字型：</b><br>
          <span class="text-sm inline-block bg-gray-100 rounded px-2">https://cdn.jsdelivr.net/npm/@fontsource/<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="cda3a2b9a2e0beaca3bee0b9ae8dfee3fee3fc">[email&#160;protected]</a>/index.min.css</span>
        </li>
        <li>
          <b>Tailwind CSS：</b><br>
          <span class="text-sm inline-block bg-gray-100 rounded px-2">https://cdn.jsdelivr.net/npm/<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="a5d1c4ccc9d2cccbc1c6d6d6e5978b978b949c">[email&#160;protected]</a>/dist/tailwind.min.css</span>
        </li>
      </ul>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-semibold mb-2 flex items-center"><i class="fas fa-question-circle mr-2"></i>常見問題（FAQ）</h2>
      <ul class="list-disc pl-5 space-y-2 text-base">
        <li>
          <b>Q: QR Code 掃描失敗怎麼辦？</b><br>
          A: 請確認相機權限已開啟，使用手機/Pad 開啟本頁較佳。如仍無法掃描可手動輸入。
        </li>
        <li>
          <b>Q: Token 無法存取 API？</b><br>
          A: 請確認 token 權限是否包含 <b>repo</b>。如更換過請在設定頁重新輸入。
        </li>
        <li>
          <b>Q: 影片/問卷資料儲存在哪裡？</b><br>
          A: 所有資料皆存於指定 GitHub repo，並以 commit 管理，可於 repo 檢視歷史。
        </li>
        <li>
          <b>Q: 問卷結果通知 Email 如何設？</b><br>
          A: 請至管理後台「設定 Email」並開啟 Enable。
        </li>
      </ul>
    </section>

    <footer class="text-sm mt-12 text-center text-gray-500">
      &copy; 2024 衛教影片網站 | 若需回報問題、功能需求請至 <a href="https://github.com/" target="_blank" rel="noopener">GitHub Repo</a> 提出 Issue
    </footer>
  </div>
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script></body>
</html>

    <script id="html_badge_script1">
        window.__genspark_remove_badge_link = "https://www.genspark.ai/api/html_badge/" +
            "remove_badge?token=To%2FBnjzloZ3UfQdcSaYfDn2QO1c3hD%2Bf5K%2BSIZ27AQJ4d6FVL9mJq9ARma5mLEzf504nB%2BOUABW6QFBMYwGKmTpEUbnFrUWnz%2FEu%2BhajGBdx%2F6%2F90AxZqd89CCSY1XVrAaq7lzumHFQr%2FzTzFLB4h8A1on7Bnjo%2BOkzXcNOAyw3M%2Bo6u0iBmwrkaI3ucQ1iSsim0jPdPM5l6gTg%2FKddOA3JX%2BedmGIXj0%2FsDbHNdcDj1zRRo5823TRlKA%2BX0dDRrQRSeZaOgt4Fcwu1zXJ9puLnP3weDgZzISKziUU9dYd52c%2BSGft69EGEM4A%2FImQ2JVy5zwuMHXgIseImJf7ST7iDd86E2aQovtWi%2BzAbRs8yU4sU0PMISNmEm7dGyQJ7hsnW%2BMR0LAV6kgOyjBnO9%2BIfAFGBNQfvD7CSt6oOfQoYU69oXx3jnJMGs1wY%2BbU7zWEeTepwiXxmqoYGZDAcH97v%2FNWzhCqI72aiNIi0pCUT2ondYiviva7xLmME1D4wg";
        window.__genspark_locale = "zh-TW";
        window.__genspark_token = "To/BnjzloZ3UfQdcSaYfDn2QO1c3hD+f5K+SIZ27AQJ4d6FVL9mJq9ARma5mLEzf504nB+OUABW6QFBMYwGKmTpEUbnFrUWnz/Eu+hajGBdx/6/90AxZqd89CCSY1XVrAaq7lzumHFQr/zTzFLB4h8A1on7Bnjo+OkzXcNOAyw3M+o6u0iBmwrkaI3ucQ1iSsim0jPdPM5l6gTg/KddOA3JX+edmGIXj0/sDbHNdcDj1zRRo5823TRlKA+X0dDRrQRSeZaOgt4Fcwu1zXJ9puLnP3weDgZzISKziUU9dYd52c+SGft69EGEM4A/ImQ2JVy5zwuMHXgIseImJf7ST7iDd86E2aQovtWi+zAbRs8yU4sU0PMISNmEm7dGyQJ7hsnW+MR0LAV6kgOyjBnO9+IfAFGBNQfvD7CSt6oOfQoYU69oXx3jnJMGs1wY+bU7zWEeTepwiXxmqoYGZDAcH97v/NWzhCqI72aiNIi0pCUT2ondYiviva7xLmME1D4wg";
    </script>
    