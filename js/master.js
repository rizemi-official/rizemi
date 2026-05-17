const responsive_menu_btn = document.querySelector('.responsive_btn');

if (responsive_menu_btn) {
  responsive_menu_btn.addEventListener('click', menuToggle);
}

function menuToggle() {
  const pcMenu = document.querySelector('.main-nav');
  const spMenu = document.querySelector('.main-nav-sp');

  if (pcMenu) {
    pcMenu.classList.toggle('menu_active');
  }

  if (spMenu) {
    spMenu.classList.toggle('menu_active');
  }

  responsive_menu_btn.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {

    /* 仮フォーム１のurl
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNO7w4N3S8LqTHigAnUygflNpqnMZKXSD-azc2o8W-m4R4_Slp4VP6E6y1a03zcXugMeITlDyUBdEw/pub?gid=972364105&single=true&output=csv';
    */

    // 仮フォーム2（5/2更新）
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRNecFBsyhfwYntqbckMYHdCS66A8NDkxyDkYujReyz0b4VTVl2TUpDCp50TSIL1AZ0S6UDhAKL0g9q/pub?gid=1374982249&single=true&output=csv';

    const container = document.getElementById('zemi-results-container');
    if(!container) return;

    container.innerHTML = '<p style="text-align: center; color: #cecece;">現在の希望状況を読み込んでいます...</p>';

    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            const allRows = parseCSV(csvText);
            // ヘッダーを除外して、第1希望（B列/index 1）の多い順に並び替え
            const dataRows = allRows.slice(1)
                .filter(row => row[0]) // 分野名が空の行を除外
                .sort((a, b) => Number(b[1]) - Number(a[1]));

            let top3Html = '';
            let otherHtml = '';

            dataRows.forEach((row, index) => {
                const fieldName = row[0];
                const first = row[1] || 0;
                const second = row[2] || 0;
                
                // 5/2更新: 概要の処理（空欄や #N/A の場合の対策）
                let description = (row[3] || '').trim();
                if (description === '' || description === '#N/A') {
                    description = '概要はまだありません。';
                }

                // --- 枠線の色を決定するロジック ---
                let borderColor = '#555'; // デフォルト（0〜2人）
                let badgeHtml = '';

                if (first >= 5) {
                    borderColor = '#ff6b6b'; // 5人以上：成立（赤/ピンク）
                    badgeHtml = '<span style="background: #ff6b6b; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-left: 0.5rem;">成立！</span>';
                } else if (first >= 3) {
                    borderColor = '#91b825'; // 3〜4人：もうすぐ（緑）
                    badgeHtml = '<span style="background: #91b825; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-left: 0.5rem;">もうすぐ！</span>';
                }

                // 5/2更新
                const cardHtml = `
                <div class="zemi-card-sp" style="margin-bottom: 1rem; background: rgba(255,255,255,0.05); border: 2px solid ${borderColor}; border-radius: 8px; padding: 1rem;">
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

                if (index < 3) {
                    top3Html += cardHtml;
                } else {
                    otherHtml += cardHtml;
                }
            });

            // HTMLの組み立て
            let finalHtml = top3Html;

            // 4位以降がある場合のみ、隠しエリアとボタンを追加
            if (otherHtml !== '') {
                finalHtml += `
                    <div id="other-zemi-fields" style="display: none;">${otherHtml}</div>
                    <div style="text-align: center; margin-top: 1rem;">
                        <button id="toggle-zemi-btn" class="btn" style="font-size: 0.9rem; padding: 0.5rem 1rem; background: #555;">
                            もっと見る
                        </button>
                    </div>
                `;
            }

            container.innerHTML = finalHtml || '<p style="text-align: center; color: #cecece;">現在、希望分野はまだありません。</p>';

            // ボタンのクリックイベント設定
            const toggleBtn = document.getElementById('toggle-zemi-btn');
            const otherFields = document.getElementById('other-zemi-fields');
            if (toggleBtn && otherFields) {
                toggleBtn.addEventListener('click', () => {
                    const isHidden = otherFields.style.display === 'none';
                    otherFields.style.display = isHidden ? 'block' : 'none';
                    toggleBtn.textContent = isHidden ? '閉じる' : 'もっと見る';
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p style="text-align: center; color: #cecece;">データの読み込みに失敗しました。</p>';
        });
});

// CSVパース関数（重複していたので1つにまとめました）
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

      // 他を閉じる
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

// PC用
setupAccordion(
  '.accordion-header',
  '.accordion-item',
  '.accordion-content'
);

// SP用
setupAccordion(
  '.accordion-header-sp',
  '.accordion-item-sp',
  '.accordion-content-sp'
);

(function () {
  const buttons = document.querySelectorAll('.js-pop-btn');

  function closeAll() {
    document.querySelectorAll('.fuzzy-pop').forEach(pop => {
      pop.classList.remove('show');
    });
  }

  function positionPop(btn, pop) {
    const rect = btn.getBoundingClientRect();
    const gap = 8;

    let left = rect.left;
    let top = rect.bottom + gap;

    pop.style.left = (left + window.scrollX) + 'px';
    pop.style.top  = (top + window.scrollY) + 'px';
  }

  // ボタン側の処理
  buttons.forEach(btn => {
    const targetId = btn.dataset.target;
    const pop = document.getElementById(targetId);

    btn.addEventListener('click', e => {
      e.stopPropagation();

      const isOpen = pop.classList.contains('show');
      closeAll();

      if (!isOpen) {
        positionPop(btn, pop);
        pop.classList.add('show');
      }
    });
  });

  // ×ボタンで閉じる
  document.querySelectorAll('.js-pop-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeAll();
    });
  });

  // 外クリックで閉じる
  document.addEventListener('click', closeAll);

  // リサイズ・スクロールで閉じる
  window.addEventListener('resize', closeAll);
  window.addEventListener('scroll', closeAll);
})();


/* =========================================================
   ここから追加：新システム（提案＆希望選択フォーム）の処理
========================================================= */

let kibou1 = "";
let kibou2 = "";

document.addEventListener("DOMContentLoaded", () => {
  const inputBunya = document.getElementById("input-bunya");
  if (inputBunya) {
    inputBunya.addEventListener("input", updateProposalButton);
  }
});

function updateProposalButton() {
  const val = document.getElementById("input-bunya").value.trim();
  const btn = document.getElementById("btn-my-proposal");
  if (!btn) return; // ボタンが存在しないページでのエラー回避

  if (val) {
    btn.innerText = `「${val}」を希望に設定する`;
    btn.disabled = false;
  } else {
    btn.innerText = "（質問1を入力してください）";
    btn.disabled = true;
  }
}

// 分野ボタンが押された時の選択・記憶処理
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

// 選び直すボタンの処理
function clearField(num) {
  if (num === 1) kibou1 = "";
  if (num === 2) kibou2 = "";
  updateDisplay();
}

// 選択状況の文字を画面に書き換える処理
function updateDisplay() {
  const disp1 = document.getElementById("disp-kibou1");
  const disp2 = document.getElementById("disp-kibou2");
  if (disp1) disp1.innerText = kibou1 || "未選択";
  if (disp2) disp2.innerText = kibou2 || "未選択";
}

// X宣伝欄の表示・非表示切り替え
function toggleXDetail() {
  const xVal = document.getElementById("input-x").value;
  const detailBox = document.getElementById("x-detail-box");
  if (detailBox) {
    detailBox.style.display = (xVal === "宣伝する") ? "block" : "none";
  }
}

// 認知経路の「その他」入力欄の表示・非表示切り替え
function toggleRouteOther() {
  const routeVal = document.getElementById("input-route").value;
  const routeOther = document.getElementById("input-route-other");
  if (routeOther) {
    routeOther.style.display = (routeVal === "その他") ? "block" : "none";
  }
}

// URLを合成してGoogleフォームを開くメイン処理
function openGoogleForm() {
  const bunya = document.getElementById("input-bunya") ? document.getElementById("input-bunya").value : "";
  const gaiyou = document.getElementById("input-gaiyou") ? document.getElementById("input-gaiyou").value : "";
  const kyomi = document.getElementById("input-kyomi") ? document.getElementById("input-kyomi").value : "";
  const xSend = document.getElementById("input-x") ? document.getElementById("input-x").value : "";
  const xDetail = document.getElementById("input-x-detail") ? document.getElementById("input-x-detail").value : "";
  const free = document.getElementById("input-free") ? document.getElementById("input-free").value : "";
  
  let route = document.getElementById("input-route") ? document.getElementById("input-route").value : "";
  if (route === "その他") {
    route = document.getElementById("input-route-other") ? document.getElementById("input-route-other").value : "";
  }

  // ★★★ ここに取得したGoogleフォームURLを貼り付けてください ★★★
  let targetUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdi0qReWcpA1bV4G844RfWvjuudknDhM6O-fB663S6uXLpoGQ/viewform?usp=pp_url&entry.669942318=DUMMY_BUNYA&entry.2097477009=DUMMY_GAIYOU&entry.1542851026=DUMMY_KIBOU1&entry.45651459=DUMMY_KIBOU2&entry.45918589=DUMMY_KYOMI&entry.1192163566=DUMMY_X&entry.2036668219=DUMMY_XDETAIL&entry.375378926=DUMMY_ROUTE&entry.405628407=DUMMY_FREE";

  // URLの中のDUMMY文字を、入力データに綺麗に置き換える
  targetUrl = targetUrl.replace("DUMMY_BUNYA", encodeURIComponent(bunya));
  targetUrl = targetUrl.replace("DUMMY_GAIYOU", encodeURIComponent(gaiyou));
  targetUrl = targetUrl.replace("DUMMY_KIBOU1", encodeURIComponent(kibou1));
  targetUrl = targetUrl.replace("DUMMY_KIBOU2", encodeURIComponent(kibou2));
  targetUrl = targetUrl.replace("DUMMY_KYOMI", encodeURIComponent(kyomi));
  targetUrl = targetUrl.replace("DUMMY_X", encodeURIComponent(xSend));
  targetUrl = targetUrl.replace("DUMMY_XDETAIL", encodeURIComponent(xDetail));
  targetUrl = targetUrl.replace("DUMMY_ROUTE", encodeURIComponent(route));
  targetUrl = targetUrl.replace("DUMMY_FREE", encodeURIComponent(free));

  // 新しいタブでGoogleフォームを開く
  window.open(targetUrl, "_blank");
}


// =========================================================
// フォームをスッと表示させてスクロールする処理
// =========================================================
function showProposalForm() {
  const formArea = document.getElementById("proposal-form-area");
  if (formArea) {
    // 隠していたフォームを表示する
    formArea.style.display = "block";
    
    // スムーススクロールでフォームの少し上まで自動で画面を動かす
    formArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
