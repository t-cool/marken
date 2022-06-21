function Marken() {
  this.text = '';
  this.explanations = [];
  // this.undo_list = [];
  // this.redo_list = [];
  this.index = 0;
}
Marken.prototype.add = function (explanation) {
  this.explanations = this.explanations.slice(0, this.index + 1);
  this.explanations.push(explanation);
  this.index = this.explanations.length - 1;
  return explanation;
};
Marken.prototype.undo = function () {
  if (this.explanations.length > 0) {
    if (this.index > -1) {
      return this.explanations[this.index--];
    }
  }
};
Marken.prototype.redo = function () {
  if (this.explanations.length > 0) {
    if (this.index < this.explanations.length - 1) {
      return this.explanations[++this.index];
    }
  }
};

function Explanation() {
  this.range = null;
  this.instruction = null;
}

function Instruction(func, args, context) {
  this.fn = null;
}
Instruction.prototype.do = function(){}

let marken = new Marken();


// 履歴関連
let history = (function(){
  // プロパティ
  let currentSymbolNumber = 1;   // 直近のアクション番号
  let allActions = {};

  // メソッド
  // 直近のアクション番号を取得
  function getCurrentSymbolNumber(){
    return currentSymbolNumber
  }

  function getPreviousSymbolNumber(){
    return currentSymbolNumber -1;
  }
  // アクション番号を inc する
  function increaseCurrentSymbolNumber(){
    currentSymbolNumber += 1;    
  }

  // アクション番号を dec する
  function decreaseCurrentSymbolNumber(){
    currentSymbolNumber -= 1;    
  }

  // 現在のアクションを allActions に追加する
  function addCurrentActionToAllActions(){
    allActions[`action${currentSymbolNumber}`] = null;
  }

  function addHintToAllActions(event){
    if (event.path[2].id == "" || event.path[2].id == undefined) return;

    allActions[event.path[2].id] = {hint: `${document.getElementById(`${event.path[0].id}`)?.value}`};
  }

  function getAllActions(){
    return allActions
  }

  return {
    getCurrentSymbolNumber: getCurrentSymbolNumber,
    increaseCurrentSymbolNumber: increaseCurrentSymbolNumber,
    decreaseCurrentSymbolNumber: decreaseCurrentSymbolNumber,
    getPreviousSymbolNumber: getPreviousSymbolNumber,

    addCurrentActionToAllActions: addCurrentActionToAllActions,
    addHintToAllActions: addHintToAllActions,
    getAllActions: getAllActions
  }
})();

// ページ内の要素を削除する
function removeElements(){
    window.document.getElementById('english').innerText = window.document.getElementById('originalTxt').value;
    window.document.getElementById('originalTxt').value = "";
    window.document.getElementById('btn').remove();
    window.document.getElementById('originalTxt').remove();
}

// つけた記号を削除する
function clear(){
    // 線記号の削除
    document.getElementById(`action${history.getPreviousSymbolNumber()}`).style = null;
    // 括弧記号 ( ) ＜ ＞ の削除
    document.getElementById(`action${history.getPreviousSymbolNumber()}`).innerHTML = 
    document.getElementById(`action${history.getPreviousSymbolNumber()}`).innerHTML.replace("＜","").replace("＞","").replace(" )","").replace("( ","").replace("⤺","");
    // ルビの消去
    document.getElementById(`action${history.getPreviousSymbolNumber()}`).removeAttribute("data-ruby");
    // id の消去
    document.getElementById(`action${history.getPreviousSymbolNumber()}`).removeAttribute("id");
    // 操作ラベルを 1 減らす
    history.decreaseCurrentSymbolNumber();
}

// 選択箇所の記号をクリアする
function clearSelected(range) {
  let newNode = document.createElement('span');
  newNode.setAttribute('style', '');
  newNode.innerHTML = range.toString().replace("＜", "").replace("＞", "").replace(" )", "").replace("( ", "").replace("⤺", "");
  range.deleteContents();
  range.insertNode(newNode);
  // 操作ラベルを 1 減らす
  history.decreaseCurrentSymbolNumber();
}

// 機能語の記号をつける
function alpha(range) {
  let newNode = document.createElement('span');
  newNode.setAttribute('data-ruby', history.getCurrentSymbolNumber());
  newNode.setAttribute('style', 'border: solid 1px black;background-color: #fff0e0');
  newNode.setAttribute('id', `action${history.getCurrentSymbolNumber()}`);
  // 半角スペース '&thinsp;'
  newNode.innerHTML = range.toString();
  range.deleteContents();
  range.insertNode(newNode);
  // 履歴に直近のアクションを追加
  history.addCurrentActionToAllActions();
  // 操作のタグ番号を更新する
  history.increaseCurrentSymbolNumber();
}

// 主語の記号をつける
function s(range) {
  let newNode = document.createElement('span');

  newNode.setAttribute('style', 'border-bottom:3px double black;padding-bottom:2px;');

  newNode.setAttribute('id', `action${history.getCurrentSymbolNumber()}`);

  // 番号をルビで実現する
  newNode.setAttribute('data-ruby', history.getCurrentSymbolNumber());

  newNode.innerHTML = range.toString();

  range.deleteContents();

  range.insertNode(newNode);

  // 履歴に直近の action を追加する
  history.addCurrentActionToAllActions();

  // 操作のタグ番号を更新する
  history.increaseCurrentSymbolNumber();
}

// 動詞の記号をつける
function v(range) {
  let newNode = document.createElement('span');
  newNode.setAttribute('style', 'border: solid 1px black;border-radius: 10px;');
  newNode.setAttribute('id', `action${history.getCurrentSymbolNumber()}`);
  newNode.setAttribute('data-ruby', history.getCurrentSymbolNumber());
  newNode.innerHTML = range.toString();
  range.deleteContents();
  range.insertNode(newNode);
  // 履歴に直近の action を追加
  history.addCurrentActionToAllActions();
  // 操作のタグ番号を更新する
  history.increaseCurrentSymbolNumber();
}

// 目的語(O)・補語(C)の記号をつける
function oc(range) {
  let newNode = document.createElement('span');
  newNode.setAttribute('style', 'border-bottom:1px solid black;padding-bottom:2px;');
  newNode.setAttribute('id', `action${history.getCurrentSymbolNumber()}`);
  newNode.setAttribute('data-ruby', history.getCurrentSymbolNumber());
  newNode.innerHTML = range.toString();
  range.deleteContents();
  range.insertNode(newNode);
  // 履歴に直近の action を追加する
  history.addCurrentActionToAllActions();
  // 操作のタグ番号を更新する
  history.increaseCurrentSymbolNumber();
}

// 副詞の記号をつける
function adv(range){
  let newNode = document.createElement('span');  
  newNode.setAttribute('data-ruby', `${history.getCurrentSymbolNumber()}`);
  newNode.setAttribute('id', `action${history.getCurrentSymbolNumber()}`);
  newNode.innerHTML = `＜${range.toString()}＞`;
  range.deleteContents();
  range.insertNode(newNode);
  // 履歴に直近の action を追加する
  history.addCurrentActionToAllActions();
  // 操作のタグ番号を更新する
  history.increaseCurrentSymbolNumber();
}

// 後置修飾の記号をつける
function adj(range) {
  let newNode = document.createElement('span');
  newNode.setAttribute('id', `action${history.getCurrentSymbolNumber()}`);
  newNode.setAttribute('data-ruby', history.getCurrentSymbolNumber());
  newNode.innerHTML = 
  `<span style="display:inline-block;transform:scale(1.5, 1);">⤺</span>( ${range.toString()} )`;
  range.deleteContents();
  range.insertNode(newNode);
  // 履歴に直近の action を追加する
  history.addCurrentActionToAllActions();
  // 操作のタグ番号を更新する
  history.increaseCurrentSymbolNumber();
}

// 原文を貼り付ける
window.btn.addEventListener('click', function (event) {
  document.getElementById("afterClick").style.display = "none";
  marken.text = window.document.getElementById('originalTxt').value;
  removeElements();
});

// 選択範囲の長さ
let selectedLength;

// キー操作
document.addEventListener('keypress', (event) => {

  // 選択範囲をとる
  const selection = document.getSelection();
  
  const range = selection.getRangeAt(0);

  const explanation = new Explanation();
  explanation.range = range;

  // 選択範囲がないときは return
  if (range.toString() == '') return;
  // 記号付け
  let keyName = event.key;
  if (keyName == 'a') {
    explanation.instruction = s;
    s(range);
  } else if (keyName == 's') {
    explanation.instruction = v;
    v(range);
  } else if (keyName == 'd') {
    explanation.instruction = oc;
    oc(range);
  } else if (keyName == 'f') {
    explanation.instruction = adv;
    adv(range);
  } else if (keyName == 'g') {
    explanation.instruction = adj;
    adj(range);
  } else if (keyName == 'z') {
    explanation.instruction = alpha;
    alpha(range);
  } else if (keyName == 'c') {
    clearSelected(range);
  }
  marken.add(explanation);
});

document.addEventListener('keydown', (event) => {
  // Cmd(Ctrl)+z で直前の操作を取り消す
  if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
    const explanation = marken.undo();
    console.log(explanation);
    if (!!explanation) {
      clearSelected(explanation.range);
    }
  } else if (event.key === 'y' && (event.ctrlKey || event.metaKey)) {
    const explanation = marken.redo();
    console.log(explanation);
    if (!!explanation) {
      explanation.instruction(explanation.range);
    }
  }
});

// ドラッグ選択の操作
const element = document.getElementById("english");

element.addEventListener('selectstart', function () {

  element.addEventListener('mouseup', function (event) {
    // 半角スペースで始まるときは選択を打ち消す
    if (window.getSelection().toString().slice(0, 1) == " ") {
      window.getSelection().removeAllRanges();
    }

    // 選択が長すぎる場合は選択を取り消す
    if (window.getSelection().toString().length >= 80) {
      window.getSelection().removeAllRanges();
    }

    // 最後が半角スペースで始まるときは選択を打ち消す
    if (window.getSelection().toString().slice(-1) == " ") {
      console.log("!")
      window.getSelection().removeAllRanges();
    }
  });
});

// ダブルクリックした要素に input text でヒントを加える
document.addEventListener('dblclick', function(event){

  // 記号がないときは return
  if(event.target.id=="english") return;
  
  document.getElementById(`${event.target.id}`).setAttribute('class','tooltip');

  let newElement = document.createElement("span");

  let newContent = document.createTextNode("");
  newElement.innerHTML += `<textarea class="hint" id="${event.target.id}_hint">`;

  newElement.appendChild(newContent);
  newElement.setAttribute("class","tooltiptext");

  document.getElementById(`${event.target.id}`).appendChild(newElement);

  // 幅を取得
  let selectedText = document.getElementById(`${event.target.id}`);
  selectedLength = selectedText.innerText.length;

  document.getElementById(`${event.target.id}_hint`).style.width = `${selectedLength*10}px`;


  history.addHintToAllActions(event);

});

// 解説コメントの更新
window.addEventListener("keyup", function(event){
  history.addHintToAllActions(event);
});

