const responsive_menu_btn = document.querySelector('.responsive_btn');

if (responsive_menu_btn) {
  responsive_menu_btn.addEventListener('click', menuToggle);
}

function menuToggle() {
  const pcMenu = document.querySelector('.main-nav');
  const spMenu = document.querySelector('.main-nav-sp');

  if (pcMenu) pcMenu.classList.toggle('menu_active');
  if (spMenu) spMenu.classList.toggle('menu_active');
  responsive_menu_btn.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {

    // 💡公開用（Sheet2）のCSV用URL
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRXJJ0GtKGzjHujGOprGAW4Yl1StEtNqI-amqHIHvzfzsMcqqMsY0H25lMNmF6tLhv7YJzJb44CD1hp/pub?gid=1890726541&single=true&output=csv';

    const container = document.getElementById('zemi-results-container');
    if(!container) return;

    container.innerHTML = '<p style="text-align: center; color: #cecece;">現在の希望状況を読み込んでいます...</p>';

    const areaPhysics = document.getElementById('area-physics');
    const areaMath = document.getElementById('area-math');
    const areaChemBio = document.getElementById('area-chem-bio'); // 💡化学と生物を統合
    const areaOther = document.getElementById('area-other');

    if (areaPhysics) areaPhysics.innerHTML = '';
    if (areaMath) areaMath.innerHTML = '';
    if (areaChemBio) areaChemBio.innerHTML = ''; // 💡ここも統合
    if (areaOther) areaOther.innerHTML = '';

    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            const allRows = parseCSV(csvText);
            
            const dataRows = allRows.slice(1)
                .filter(row => row[0]) 
                .sort((a, b) => Number(b[1]) - Number(a[1]));

            let top3Html = '';
            let otherHtml = '';

            dataRows.forEach((row, index) => {
                const fieldName = row[0];
                const first = row[1] || 0;
                const second = row[2] || 0;
                
                let description = (row[3] || '').trim();
                if (description === '' || description === '#N/A') {
                    description = '概要はまだありません。';
                }

                const tagsField = row[4] || '';

                const btnHtml = `<button type="button" class="field-btn" onclick="selectField('${fieldName}')">${fieldName}</button> `;
                
                let hasMainTag = false; 

                if (tagsField.includes('物理') && areaPhysics) {
                    areaPhysics.insertAdjacentHTML('beforeend', btnHtml);
                    hasMainTag = true;
                }
                if (tagsField.includes('数学') && areaMath) {
                    areaMath.insertAdjacentHTML('beforeend', btnHtml);
                    hasMainTag = true;
                }
                // 💡化学または生物が含まれていれば、統合エリアに入れる
                if ((tagsField.includes('化学') || tagsField.includes('生物')) && areaChemBio) {
                    areaChemBio.insertAdjacentHTML('beforeend', btnHtml);
                    hasMainTag = true;
                }
                if ((tagsField.includes('その他') || !hasMainTag) && areaOther) {
                    areaOther.insertAdjacentHTML('beforeend', btnHtml);
                }

                let borderColor = '#555'; 
                let badgeHtml = '';

                if (first >= 5) {
                    borderColor = '#ff6b6b'; 
                    badgeHtml = '<span style="background: #ff6b6b; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-left: 0.5rem;">成立！</span>';
                } else if (first >= 3) {
                    borderColor = '#91b825'; 
                    badgeHtml = '<span style="background: #91b825; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-left: 0.5rem;">もうすぐ！</span>';
                }

                // 💡PC横2列対応のため margin-bottom を消し、height: 100% と box-sizing を追加
                const cardHtml = `
                <div class="zemi-card-sp" style="background: rgba(255,255,255,0.05); border: 2px solid ${borderColor}; border-radius: 8px; padding: 1rem; height: 100%; box-sizing: border-box;">
                    <h3 style="margin: 0 0 0.8rem 0; font-size: 1.1rem; color: #fff;">
                        ${fieldName} ${badgeHtml}
                    </h3>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.8rem;">
                        <span style="background: #e6b422; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">第1希望: ${first}人</span>
                        <span style="background: #999; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">第2希望: ${second}人</span>
                    </div>
                    <details style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;">
                        <summary style="cursor: pointer; font-weight: bold; color: #cecece; font-size: 0.9rem; outline: none;">概要を見る</summary>
                        <p style="margin-top: 0.5rem; margin-bottom: 0; color: #bbb; font-size: 0.85rem; line-height: 1.5;">
                            ${description.replace(/\n/g, '<br>')}
                        </p>
                    </details>
                </div>`;

                // 💡PC表示で最初は横並び1行分（2件）にする設定
                if (index < 2) {
                    top3Html += cardHtml;
                } else {
                    otherHtml += cardHtml;
                }
            });

            // 💡カード全体をCSSのグリッド用の箱（zemi-grid-container）で囲む
            let finalHtml = `<div class="zemi-grid-container">${top3Html}</div>`;
            if (otherHtml !== '') {
                finalHtml += `
                    <div id="other-zemi-fields" class="zemi-grid-container" style="display: none; margin-top: 20px;">${otherHtml}</div>
                    <div style="text-align: center; margin-top: 1.5rem;">
                        <button id="toggle-zemi-btn" class="btn" style="font-size: 0.9rem; padding: 0.5rem 1rem; background: #555;">
                            もっと見る
                        </button>
                    </div>
                `;
            }

            container.innerHTML = finalHtml || '<p style="text-align: center; color: #cecece;">現在、希望分野はまだありません。</p>';

            const toggleBtn = document.getElementById('toggle-zemi-btn');
            const otherFields = document.getElementById('other-zemi-fields');
            if (toggleBtn && otherFields) {
                toggleBtn.addEventListener('click', () => {
                    const isHidden = otherFields.style.display === 'none';
                    // 💡もっと見るを押したときの表示も「block」ではなく「grid」にする
                    otherFields.style.display = isHidden ? 'grid' : 'none';
                    toggleBtn.textContent = isHidden ? '閉じる' : 'もっと見る';
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p style="text-align: center; color: #cecece;">データの読み込みに失敗しました。</p>';
        });
});

// CSVパース関数
function parseCSV(str) {
    const result = [];
    let row = [], inQuotes = false, val = "";
    for (let i = 0; i < str.length; i++) {
        let c = str[i];
        if (inQuotes) {
            if (c === '"' && str[i+1] === '"') { val += '"'; i++; }
            else if (c === '"') { inQuotes = false; }
            else { val += c; }
        } else {
            if (c === '"') { inQuotes = true; }
            else if (c === ',') { row.push(val); val = ""; }
            else if (c === '\n' || c === '\r') {
                row.push(val); val = ""; result.push(row); row = [];
                if (c === '\r' && str[i+1] === '\n') i++;
            }
            else { val += c; }
        }
    }
    if (val || row.length > 0) { row.push(val); result.push(row); }
    return result;
}

// ゼミ班アコーディオン
function setupAccordion(headerClass, itemClass, contentClass) {
  document.querySelectorAll(headerClass).forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      document.querySelectorAll(itemClass).forEach((el) => {
        if (el !== item) {
          el.classList.remove('active');
          const c = el.querySelector(contentClass);
          if (c) c.style.maxHeight = null;
        }
      });
      item.classList.toggle('active');
      const content = item.querySelector(contentClass);
      if (item.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = null;
      }
    });
  });
}

setupAccordion('.accordion-header', '.accordion-item', '.accordion-content');
setupAccordion('.accordion-header-sp', '.accordion-item-sp', '.accordion-content-sp');

/* =========================================================
   新システム（提案＆希望選択フォーム）の処理
========================================================= */
let kibou1 = "";
let kibou2 = "";

document.addEventListener("DOMContentLoaded", () => {
  const inputBunya = document.getElementById("input-bunya");
  if (inputBunya) {
    inputBunya.addEventListener("input", updateProposalButton);
  }

  // 必須項目のリアルタイム監視設定
  const requiredIds = ["input-kyomi", "input-x", "input-route", "input-route-other"];
  requiredIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", checkRequiredFields);
      el.addEventListener("input", checkRequiredFields);
    }
  });

  // 初回起動時にボタンをグレーアウト状態にしておく
  checkRequiredFields();
});

// 必須項目がすべて埋まっているか判定する関数
function checkRequiredFields() {
  const kyomi = document.getElementById("input-kyomi") ? document.getElementById("input-kyomi").value.trim() : "";
  const xSend = document.getElementById("input-x") ? document.getElementById("input-x").value.trim() : "";
  const route = document.getElementById("input-route") ? document.getElementById("input-route").value.trim() : "";
  
  let isValid = true;
  
  // 未入力の項目があれば false（不可）にする
  if (kyomi === "") isValid = false;
  if (xSend === "") isValid = false;
  if (route === "") isValid = false;

  // もし「その他」を選んでいるのに、その他の詳細欄が空っぽなら false
  if (route === "その他") {
      const routeOther = document.getElementById("input-route-other") ? document.getElementById("input-route-other").value.trim() : "";
      if (routeOther === "") isValid = false;
  }

  const submitBtn = document.getElementById("submit-form-btn");
  if (submitBtn) {
    if (isValid) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
    } else {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.5";
      submitBtn.style.cursor = "not-allowed";
    }
  }
}

// 💡 提案分野が入力されたら、ジャンル選択・概要入力欄を表示する処理
function updateProposalButton() {
  const val = document.getElementById("input-bunya").value.trim();
  const btn = document.getElementById("btn-my-proposal");
  const hiddenArea = document.getElementById("hidden-proposal-area"); // HTMLで追加した隠しエリアのID

  if (val) {
    // 文字が1文字でも入力されていれば表示＆ボタン有効化
    if (btn) {
      btn.innerText = `「${val}」を希望に設定する`;
      btn.disabled = false;
    }
    if (hiddenArea) {
      hiddenArea.style.display = "block";
    }
  } else {
    // 文字が消されて空っぽになったら隠す＆ボタン無効化
    if (btn) {
      btn.innerText = "（質問1を入力してください）";
      btn.disabled = true;
    }
    if (hiddenArea) {
      hiddenArea.style.display = "none";
    }
  }
}

function selectField(fieldName) {
  if (!fieldName || fieldName.trim() === "") return;
  fieldName = fieldName.trim();

  if (!kibou1) {
    kibou1 = fieldName;
  } else if (!kibou2 && kibou1 !== fieldName) {
    kibou2 = fieldName;
  } else if (kibou1 === fieldName || kibou2 === fieldName) {
    alert("その分野はすでに選択されています。");
  } else {
    alert("すでに第2希望まで選択されています。「選び直す」を押して解除してください。");
  }
  updateDisplay();
}

function clearField(num) {
  if (num === 1) kibou1 = "";
  if (num === 2) kibou2 = "";
  updateDisplay();
}

function updateDisplay() {
  const disp1 = document.getElementById("disp-kibou1");
  const disp2 = document.getElementById("disp-kibou2");
  if (disp1) disp1.innerText = kibou1 || "未選択";
  if (disp2) disp2.innerText = kibou2 || "未選択";
}

function toggleXDetail() {
  const xVal = document.getElementById("input-x").value;
  const detailBox = document.getElementById("x-detail-box");
  if (detailBox) detailBox.style.display = (xVal === "宣伝する" || xVal === "はい（呼び掛けを希望する）") ? "block" : "none";
  checkRequiredFields(); 
}

function toggleRouteOther() {
  const routeVal = document.getElementById("input-route").value;
  const routeOther = document.getElementById("input-route-other");
  if (routeOther) routeOther.style.display = (routeVal === "その他") ? "block" : "none";
  checkRequiredFields(); 
}

function openGoogleForm() {
  const bunya = document.getElementById("input-bunya") ? document.getElementById("input-bunya").value : "";
  const genre = document.getElementById("input-genre") ? document.getElementById("input-genre").value : ""; 
  const gaiyou = document.getElementById("input-gaiyou") ? document.getElementById("input-gaiyou").value : "";
  const kyomi = document.getElementById("input-kyomi") ? document.getElementById("input-kyomi").value : "";
  const xSend = document.getElementById("input-x") ? document.getElementById("input-x").value : "";
  const xDetail = document.getElementById("input-x-detail") ? document.getElementById("input-x-detail").value : "";
  const free = document.getElementById("input-free") ? document.getElementById("input-free").value : "";
  
  let route = document.getElementById("input-route") ? document.getElementById("input-route").value : "";
  if (route === "その他") {
    route = document.getElementById("input-route-other") ? document.getElementById("input-route-other").value : "";
  }

 
  let targetUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdi0qReWcpA1bV4G844RfWvjuudknDhM6O-fB663S6uXLpoGQ/viewform?usp=pp_url&entry.669942318=DUMMY_BUNYA&entry.930125208=DUMMY_GENRE&entry.2097477009=DUMMY_GAIYOU&entry.1542851026=DUMMY_KIBOU1&entry.45651459=DUMMY_KIBOU2&entry.45918589=DUMMY_KYOMI&entry.1192163566=DUMMY_X&entry.2036668219=DUMMY_XDETAIL&entry.375378926=DUMMY_ROUTE&entry.405628407=DUMMY_FREE";

  targetUrl = targetUrl.replace("DUMMY_BUNYA", encodeURIComponent(bunya));
  targetUrl = targetUrl.replace("DUMMY_GENRE", encodeURIComponent(genre)); 
  targetUrl = targetUrl.replace("DUMMY_GAIYOU", encodeURIComponent(gaiyou));
  targetUrl = targetUrl.replace("DUMMY_KIBOU1", encodeURIComponent(kibou1));
  targetUrl = targetUrl.replace("DUMMY_KIBOU2", encodeURIComponent(kibou2));
  targetUrl = targetUrl.replace("DUMMY_KYOMI", encodeURIComponent(kyomi));
  targetUrl = targetUrl.replace("DUMMY_X", encodeURIComponent(xSend));
  targetUrl = targetUrl.replace("DUMMY_XDETAIL", encodeURIComponent(xDetail));
  targetUrl = targetUrl.replace("DUMMY_ROUTE", encodeURIComponent(route));
  targetUrl = targetUrl.replace("DUMMY_FREE", encodeURIComponent(free));

  window.open(targetUrl, "_blank");
}

function showProposalForm() {
  const formArea = document.getElementById("proposal-form-area");
  if (formArea) {
    formArea.style.display = "block";
    formArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
