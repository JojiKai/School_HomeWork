// 撲克牌設定
const suits = ["♠", "♥", "♦", "♣"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

// 選取 HTML 元素
const playerChipsElement = document.getElementById("player-chips");
const currentBetElement = document.getElementById("current-bet");
const dealerCardsElement = document.getElementById("dealer-cards");
const playerCardsElement = document.getElementById("player-cards");
const dealerScoreElement = document.getElementById("dealer-score");
const playerScoreElement = document.getElementById("player-score");
const resultTextElement = document.getElementById("result-text");
const dealButton = document.getElementById("deal-button");
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");

// 遊戲狀態
let playerChips = 1000;
let currentBet = 0;
let dealerCards = [];
let playerCards = [];
let dealerScore = 0;
let playerScore = 0;
let deck = [];

// 初始化撲克牌
function initializeDeck() {
  deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  deck = deck.sort(() => Math.random() - 0.5); // 洗牌
}

// 抽取一張牌
function drawCard() {
  return deck.pop();
}

// 計算分數
function calculateScore(cards) {
  let score = 0;
  let aceCount = 0;

  for (const card of cards) {
    if (card.value === "A") {
      score += 11;
      aceCount++;
    } else if (["K", "Q", "J"].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  }

  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score;
}

// 更新畫面
function updateUI() {
  playerChipsElement.textContent = playerChips;
  currentBetElement.textContent = currentBet;
  dealerScoreElement.textContent = dealerScore;
  playerScoreElement.textContent = playerScore;

  dealerCardsElement.innerHTML = dealerCards
    .map((card) => `<div class="card">${card.value}${card.suit}</div>`)
    .join("");
  playerCardsElement.innerHTML = playerCards
    .map((card) => `<div class="card">${card.value}${card.suit}</div>`)
    .join("");
}

// 發牌動畫
function dealCard(target, card) {
  return new Promise((resolve) => {
    setTimeout(() => {
      target.push(card);
      updateUI();
      resolve();
    }, 500);
  });
}

// 開始遊戲
function startGame() {
  initializeDeck();
  dealerCards = [];
  playerCards = [];
  dealerScore = 0;
  playerScore = 0;
  resultTextElement.textContent = "遊戲進行中...";
  dealButton.disabled = true;
  hitButton.disabled = false;
  standButton.disabled = false;

  // 發牌過程
  (async () => {
    await dealCard(playerCards, drawCard());
    await dealCard(dealerCards, drawCard());
    await dealCard(playerCards, drawCard());
    await dealCard(dealerCards, drawCard());

    playerScore = calculateScore(playerCards);
    dealerScore = calculateScore(dealerCards);
    updateUI();
  })();
}

// 玩家下注
document.getElementById("bet-50").addEventListener("click", () => {
  if (playerChips >= 50) {
    playerChips -= 50;
    currentBet += 50;
    dealButton.disabled = false;
    updateUI();
  }
});

document.getElementById("bet-100").addEventListener("click", () => {
  if (playerChips >= 100) {
    playerChips -= 100;
    currentBet += 100;
    dealButton.disabled = false;
    updateUI();
  }
});

// 按鈕事件
dealButton.addEventListener("click", startGame);

hitButton.addEventListener("click", async () => {
  await dealCard(playerCards, drawCard());
  playerScore = calculateScore(playerCards);
  if (playerScore > 21) {
    resultTextElement.textContent = "玩家爆牌，莊家勝！";
    endGame(false);
  }
});

standButton.addEventListener("click", async () => {
  hitButton.disabled = true;
  standButton.disabled = true;

  // 莊家發牌
  while (dealerScore < 17) {
    await dealCard(dealerCards, drawCard());
    dealerScore = calculateScore(dealerCards);
  }

  if (dealerScore > 21 || playerScore > dealerScore) {
    resultTextElement.textContent = "玩家勝！";
    endGame(true);
  } else if (dealerScore === playerScore) {
    resultTextElement.textContent = "平手！";
    endGame(false);
  } else {
    resultTextElement.textContent = "莊家勝！";
    endGame(false);
  }
});

// 遊戲結束
function endGame(playerWins) {
  dealButton.disabled = false;
  hitButton.disabled = true;
  standButton.disabled = true;

  if (playerWins) {
    playerChips += currentBet * 2;
  }
  currentBet = 0;
  updateUI();
}
