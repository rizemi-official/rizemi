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
