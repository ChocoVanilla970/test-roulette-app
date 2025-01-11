// カテゴリーデータファイルから読み込む関数
async function loadCategoriesData() {
  const response = await fetch('categories.json');
  const categoriesData = await response.json();
  return categoriesData;
}

// HTMLを動的に生成する関数
async function createCompactViewElements(categoriesData) {
  const categoriesContainer = document.getElementById('categories-container');
  categoriesContainer.innerHTML = ''; // コンテナをクリア

  // Cookieから保存された選択肢データを読み込む
  const savedOptions = loadOptionsFromCookie();

  for (const categoryData of categoriesData) {
    // カテゴリー名要素を作成
    const categoryName = document.createElement('h3');
    categoryName.innerHTML = categoryData.name;
    categoriesContainer.appendChild(categoryName);

    // オプションコンテナ要素を作成
    const optionContainer = document.createElement('div');
    optionContainer.classList.add('option-container');

    for (const option of categoryData.options) {
      const optionColumn = document.createElement('div');
      optionColumn.classList.add('option-column');

      const optionName = document.createElement('div');
      optionName.classList.add('option-name');
      optionName.innerHTML = option.name;
      optionColumn.appendChild(optionName);

      const optionChoices = document.createElement('div');
      optionChoices.classList.add('option-choices');

      // ユーザーが保存した選択肢があればそれを表示
      const savedChoice = savedOptions[categoryData.name] && savedOptions[categoryData.name][option.name];
      if (savedChoice) {
          const choiceDiv = document.createElement('div');
          choiceDiv.dataset.value = savedChoice;
          choiceDiv.textContent = savedChoice;
          choiceDiv.classList.add('selected');
          optionChoices.appendChild(choiceDiv);
      } else {
          // 保存された選択肢がない場合は、空の div を追加（高さを揃えるため）
          optionChoices.appendChild(document.createElement('div'));
      }

      optionColumn.appendChild(optionChoices);
      optionContainer.appendChild(optionColumn);
    }
    categoriesContainer.appendChild(optionContainer);
  }
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

// ページ読み込み時の処理
window.addEventListener('DOMContentLoaded', async () => {
  const categoriesData = await loadCategoriesData();
  createCompactViewElements(categoriesData);
});