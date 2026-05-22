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

                // 💡PC表示用：最初は2件表示（1行）
                if (index < 2) {
                    top3Html += cardHtml;
                } else {
                    otherHtml += cardHtml;
                }
            });

            // 💡グリッドコンテナで囲む
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

  const requiredIds = ["input-kyomi", "input-x", "input-route", "input-route-other"];
  requiredIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", checkRequiredFields);
      el.addEventListener("input", checkRequiredFields);
    }
  });

  checkRequiredFields();
});

function checkRequiredFields() {
  const kyomi = document.getElementById("input-kyomi") ? document.getElementById("input-kyomi").value.trim() : "";
  const xSend = document.getElementById("input-x") ? document.getElementById("input-x").value.trim() : "";
  const route = document.getElementById("input-route") ? document.getElementById("input-route").value.trim() : "";
  
  let isValid = true;
  if (kyomi === "") isValid = false;
  if (xSend === "") isValid = false;
  if (route === "") isValid = false;

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
