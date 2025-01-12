// 設定ファイルを非同期で読み込む関数
async function loadConfig() {
  const response = await fetch('config.json');
  const config = await response.json();
  return config;
}

// カテゴリーデータファイルから読み込む関数
async function loadCategoriesData() {
  const response = await fetch('categories.json');
  const categoriesData = await response.json();
  return categoriesData;
}

// スタイルを適用する関数（config.json からのスタイル設定は削除）
function applyConfig(config) {
  // オプション名のスタイルを設定
  const optionNameStyle = `
      background-color: ${config.option.cellColor};
      border-color: ${config.option.borderColor};
      font-size: ${config.option.font.size};
      font-family: ${config.option.font.family};
      font-weight: ${config.option.font.weight};
  `;

  // 未選択時の選択肢のスタイルを設定（デフォルト）
  const choiceUnselectedStyle = `
      background-color: ${config.choices.unselected.cellColor};
      color: ${config.choices.unselected.font.color};
      font-size: ${config.choices.unselected.font.size};
      font-family: ${config.choices.unselected.font.family};
  `;

  // 選択時の選択肢のスタイルを設定（デフォルト）
  const choiceSelectedStyle = `
      background-color: ${config.choices.selected.cellColor};
      color: ${config.choices.selected.font.color};
      font-size: ${config.choices.selected.font.size};
      font-family: ${config.choices.selected.font.family};
  `;

  // 選択肢全体の外枠のスタイル
  const choicesBorderStyle = `
      border: ${config.choices.border.width} solid ${config.choices.border.color};
  `;

  // スタイルを適用
  const style = document.createElement('style');
  style.innerHTML = `
      .option-name { ${optionNameStyle} }
      .option-choices { ${choicesBorderStyle} }
      .option-choices div { ${choiceUnselectedStyle} }
      .option-choices div.selected { ${choiceSelectedStyle} }
  `;
  document.head.appendChild(style);
}
// HTMLを動的に生成する関数
async function createRouletteElements(categoriesData, config) {
  const categoriesContainer = document.getElementById('categories-container');
  categoriesContainer.innerHTML = ''; // コンテナをクリア

  // Cookieから保存された選択肢データを読み込む
  const savedOptions = loadOptionsFromCookie();

  for (const categoryData of categoriesData) {
    // カテゴリー要素を作成
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');

    // カテゴリーデータにスタイル設定があれば適用
    if (categoryData.color) {
      categoryDiv.style.borderColor = categoryData.color.borderColor;
      categoryDiv.style.backgroundColor = categoryData.color.backgroundColor;
    }

    // ルーレット開始ボタンを作成
    const startButton = document.createElement('button');
    startButton.classList.add('start-button');
    startButton.textContent = 'ルーレット開始';
    categoryDiv.appendChild(startButton);

    // カテゴリー名要素を作成
    const categoryName = document.createElement('h3');
    categoryName.innerHTML = categoryData.name;
    categoryDiv.appendChild(categoryName);

    // オプションコンテナ要素を作成
    const optionContainer = document.createElement('div');
    optionContainer.classList.add('option-container');

    for (const option of categoryData.options) {
      const optionColumn = document.createElement('div');
      optionColumn.classList.add('option-column');

      const optionName = document.createElement('div');
      optionName.classList.add('option-name');
      optionName.innerHTML = option.name;

      // オプション名にスタイル設定があれば適用
      if (option.style) {
        applyOptionNameStyle(optionName, option.style);
      }

      optionColumn.appendChild(optionName);

      const optionChoices = document.createElement('div');
      optionChoices.classList.add('option-choices');

      // ユーザーが保存した選択肢があればそれを初期値として設定
      const savedChoices = savedOptions[categoryData.name] && savedOptions[categoryData.name][option.name];

      for (const choice of option.choices) {
        const choiceDiv = document.createElement('div');
        const choiceValue = typeof choice === 'object' ? choice.value : choice;
        choiceDiv.dataset.value = choiceValue;
        choiceDiv.textContent = choiceValue;

        // 選択状態を設定
        if (savedChoices && savedChoices.includes(choiceValue)) {
          choiceDiv.classList.add('selected');
          choiceDiv.classList.remove('unselected-style');
        } else {
          choiceDiv.classList.add('unselected-style');
        }

        // 個別スタイルを適用
        if (typeof choice === 'object') {
          applyChoiceStyle(choiceDiv, choice.unselected, false);
          applyChoiceStyle(choiceDiv, choice.selected, true);
        }

        optionChoices.appendChild(choiceDiv);
      }

      optionColumn.appendChild(optionChoices);
      optionContainer.appendChild(optionColumn);
    }

    categoryDiv.appendChild(optionContainer);
    categoriesContainer.appendChild(categoryDiv);
  }
}

// オプション名のスタイルを適用する関数
function applyOptionNameStyle(element, styleData) {
  if (styleData.cellColor) {
    element.style.backgroundColor = styleData.cellColor;
  }
  if (styleData.borderColor) {
    element.style.borderColor = styleData.borderColor;
  }
  if (styleData.borderWidth) {
    element.style.borderWidth = styleData.borderWidth;
  }
  if (styleData.font) {
    if (styleData.font.color) {
      element.style.color = styleData.font.color;
    }
    if (styleData.font.size) {
      element.style.fontSize = styleData.font.size;
    }
    if (styleData.font.family) {
      element.style.fontFamily = styleData.font.family;
    }
    if (styleData.font.weight) {
      element.style.fontWeight = styleData.font.weight;
    }
  }
}

// 選択肢のスタイルを適用する関数
function applyChoiceStyle(element, styleData, isSelected) {
  if (styleData) {
    if (styleData.cellColor) {
      element.style.backgroundColor = styleData.cellColor;
    }
    if (styleData.borderColor) {
      element.style.borderColor = styleData.borderColor;
    }
    if (styleData.borderWidth) {
      element.style.borderWidth = styleData.borderWidth;
    }
    if (styleData.font) {
      if (styleData.font.color) {
        element.style.color = styleData.font.color;
      }
      if (styleData.font.size) {
        element.style.fontSize = styleData.font.size;
      }
      if (styleData.font.family) {
        element.style.fontFamily = styleData.font.family;
      }
    }
  }
  // 選択状態によってクラスを切り替える
  if (isSelected) {
    element.classList.add('selected-style');
  } else {
    element.classList.add('unselected-style');
  }
}

// カテゴリー要素をすべて取得
const categories = document.getElementsByClassName('category');
// 「ルーレット全開始」ボタンを取得
const allStartButton = document.getElementById('all-start-button');
// 「コンパクト表示」ボタンを取得
const compactViewButton = document.getElementById('compact-view-button');
//実行中のルーレットのカウント
let runningRouletteCount = 0;

/**
 * 指定されたオプションセルのルーレットを開始する関数
 * @param {HTMLElement} optionChoices - ルーレットを行うオプションの選択肢群
 * @param {string} categoryName - カテゴリー名
 * @param {string} optionName - オプション名
 * @returns {number} - 設定されたインターバルのID
 */
function startRoulette(optionChoices, categoryName, optionName) {
  // 選択肢の要素をすべて取得
  const options = optionChoices.querySelectorAll('div');
  // 現在のインデックスを初期化
  let currentIndex = 0;

  // 現在選択されているオプションをリセット
  const selectedOption = optionChoices.querySelector('.selected');
  if (selectedOption) {
    selectedOption.classList.remove('selected');
    // 選択解除時に unselected-style クラスを付与
    selectedOption.classList.add('unselected-style');
  }

  // ルーレットのアニメーションを開始（1秒間に15フレーム）
  const intervalId = setInterval(() => {
    // 現在のオプションの選択状態を解除
    options[currentIndex].classList.remove('selected');
    options[currentIndex].classList.add('unselected-style');
    // ランダムに新しいインデックスを選択
    currentIndex = Math.floor(Math.random() * options.length);
    // 新しいオプションを選択状態にする
    options[currentIndex].classList.add('selected');
    options[currentIndex].classList.remove('unselected-style');
  }, 1000 / 15);

  // インターバルIDを返す
  return intervalId;
}

/**
 * ルーレットを停止し、選択されたオプションを保存する関数
 * @param {number} intervalId - 停止するルーレットのインターバルID
 * @param {HTMLElement} optionChoices - ルーレットが実行されているオプションの選択肢群
 * @param {string} categoryName - カテゴリー名
 * @param {string} optionName - オプション名
 */
function stopRoulette(intervalId, optionChoices, categoryName, optionName) {
  // 指定されたインターバルをクリア（ルーレット停止）
  clearInterval(intervalId);
  // 停止時に選択されているオプションを取得
  const selectedOption = optionChoices.querySelector('.selected');
  if (selectedOption) {
    console.log("Selected option:", selectedOption.dataset.value);
    // 選択解除時に unselected-style クラスを付与
    selectedOption.classList.add('unselected-style');

    // 選択されたオプションをCookieに保存
    const selectedValue = selectedOption.dataset.value;
    saveOptionChoiceToCookie(categoryName, optionName, selectedValue);
  }
}

/**
 * ボタンの表示/非表示を切り替える関数
 * @param {HTMLElement} startButton - 押された開始
 * @param {boolean} stop - ボタンの状態（true: 停止, false: 開始）
 */
function toggleButtons(startButton, stop) {
  // すべてのボタンを取得
  const buttons = document.querySelectorAll('button');
  // 各ボタンに対して処理を実行
  buttons.forEach(button => {
    // 押されたボタン以外を対象とする
    if (button !== startButton && button.id !== 'compact-view-button') {
      // 停止状態なら非表示、開始状態なら表示
      button.style.display = stop ? 'none' : 'block';
    }
  });
  // 押されたボタンのテキストを更新
  startButton.textContent = stop ? '停止' : (startButton.id === 'all-start-button' ? 'ルーレット全開始' : 'ルーレット開始');
}

// 各カテゴリーに対して処理を実行
function setCategory() {
  for (let i = 0; i < categories.length; i++) {
    let category = categories[i];
    const categoryName = category.querySelector('h3').innerText;
    // カテゴリー内の開始ボタンを取得
    const startButton = category.querySelector('.start-button');
    // カテゴリー内のすべてのオプション列を取得
    const optionColumns = category.querySelectorAll('.option-column');
    // インターバルIDを格納する配列を初期化
    let intervalIds = [];

    startButton.addEventListener('click', () => {
      // ボタンのテキストが「開始」を含むかどうかで開始/停止を判断
      const isStarting = startButton.textContent.includes('開始');
      // ボタンの状態を切り替える
      toggleButtons(startButton, isStarting);

      if (isStarting) {
        //実行中のルーレットのカウント
        runningRouletteCount++;
        // インターバルIDの配列を初期化
        intervalIds = [];
        // 各オプション列に対してルーレットを開始
        optionColumns.forEach(optionColumn => {
          const optionChoices = optionColumn.querySelector('.option-choices');
          const optionName = optionColumn.querySelector('.option-name').innerText;
          intervalIds.push(startRoulette(optionChoices, categoryName, optionName));
        });
      } else {
        // 各インターバルを停止し、選択状態をリセット
        //実行中のルーレットのカウント
        runningRouletteCount--;
        intervalIds.forEach((intervalId, index) => {
          const optionChoices = optionColumns[index].querySelector('.option-choices');
          const optionName = optionColumns[index].querySelector('.option-name').innerText;
          stopRoulette(intervalId, optionChoices, categoryName, optionName);
        });
        // インターバルIDの配列をクリア
        intervalIds = [];
      }
    });
  }
}

// 「ルーレット全開始」ボタンのクリックイベントリスナーを設定
allStartButton.addEventListener('click', () => {
  // ボタンのテキストが「開始」を含むかどうかで開始/停止を判断
  const isStarting = allStartButton.textContent.includes('開始');
  // ボタンの状態を切り替える
  toggleButtons(allStartButton, isStarting);

  if (isStarting) {
    //実行中のルーレットのカウント
    runningRouletteCount = categories.length;
    // すべてのカテゴリーのルーレットを開始
    for (let i = 0; i < categories.length; i++) {
      let category = categories[i];
      const optionColumns = category.querySelectorAll('.option-column');
      optionColumns.forEach(optionColumn => {
        const optionChoices = optionColumn.querySelector('.option-choices');
        optionColumn.intervalId = startRoulette(optionChoices); // 各オプション列にインターバルIDを保存
      });
    }
  } else {
    // すべてのカテゴリーのルーレットを停止
    runningRouletteCount = 0;
    for (let i = 0; i < categories.length; i++) {
      let category = categories[i];
      const categoryName = category.querySelector('h3').innerText;
      const optionColumns = category.querySelectorAll('.option-column');
      optionColumns.forEach(optionColumn => {
        const optionChoices = optionColumn.querySelector('.option-choices');
        const optionName = optionColumn.querySelector('.option-name').innerText;
        const selectedOption = optionChoices.querySelector('.selected');
        if (selectedOption) {
          console.log("Selected option:", selectedOption.dataset.value);
          selectedOption.classList.remove('selected'); // リセット処理
          selectedOption.classList.add('unselected-style'); // 選択解除時にスタイルを適用
        }
        stopRoulette(optionColumn.intervalId, optionChoices, categoryName, optionName); // 保存されたインターバルIDを使用して停止
      });
    }
  }
});

// Cookieに選択肢を保存する関数
function saveOptionChoiceToCookie(categoryName, optionName, choiceValue) {
  const currentOptions = loadOptionsFromCookie();
  if (!currentOptions[categoryName]) {
    currentOptions[categoryName] = {};
  }
  currentOptions[categoryName][optionName] = [choiceValue];
  document.cookie = `rouletteOptions=${JSON.stringify(currentOptions)};max-age=31536000;path=/`; // 有効期限1年
}

// Cookieから選択肢を読み込む関数
function loadOptionsFromCookie() {
  const cookieString = document.cookie
    .split('; ')
    .find(row => row.startsWith('rouletteOptions='));

  if (cookieString) {
    const decodedString = decodeURIComponent(cookieString.split('=')[1]);
    try {
      return JSON.parse(decodedString);
    } catch (error) {
      console.error("Error parsing cookie:", error);
      return {};
    }
  }
  return {};
}

// 「コンパクト表示」ボタンのクリックイベントリスナーを設定
compactViewButton.addEventListener('click', () => {
  // 現在の選択状態をCookieに保存
  const categories = document.querySelectorAll('.category');
  const optionsToSave = {};
  categories.forEach(category => {
    const categoryName = category.querySelector('h3').innerText;
    optionsToSave[categoryName] = {};
    const optionColumns = category.querySelectorAll('.option-column');
    optionColumns.forEach(optionColumn => {
      const optionName = optionColumn.querySelector('.option-name').innerText;
      const selectedOption = optionColumn.querySelector('.option-choices .selected');
      if (selectedOption) {
        optionsToSave[categoryName][optionName] = [selectedOption.dataset.value]; // 配列で値を保存
      }
    });
  });
  document.cookie = `rouletteOptions=${JSON.stringify(optionsToSave)};max-age=31536000;path=/`; // 有効期限1年

  // 新しいタブでコンパクト表示画面を開く
  window.open('compact.html', '_blank');
});

// ページ読み込み時の処理
window.addEventListener('DOMContentLoaded', async () => {
  const config = await loadConfig();
  const categoriesData = await loadCategoriesData();

  applyConfig(config);
  createRouletteElements(categoriesData, config);
  setCategory();
});