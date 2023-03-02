"use strict";


// 選択中の細胞の情報を表示する <table> 要素の ID です。
const tableId = "info_table";

// 表中で統計量を表示する <tr> 要素のクラス名です。
const statsClassName = "stats";

// ファイルの読み込みや処理の途中であるかを表します。
// 途中であれば新しいファイルの読み込みや処理を行わないようにします。
let isProcessingFile = false;

/**
 * ビューワーにファイルが読み込まれた場合のイベント ハンドラーを返します。
 *
 * @param {Viewer} viewer ビューワーです。
 * @param {HTMLElement} fileNameHolder ファイル名を書き込む要素です。
 * @param {HTMLElement} infoTableHolder 細胞の情報を表示する要素です。
 * @return {function} fileNameHolder 引数にファイル名を書き込み、
 *     infoTableHolder 引数にファイルの内容を反映した表 (ID: "info_table") 
 *     のヘッダーを作成するイベント ハンドラーです。
 */
function viewerOnLoaded(viewer, fileNameHolder, infoTableHolder) {

  return function () {
    fileNameHolder.textContent = "File: " + viewer.loadedFileName;

    // それまでの細胞の情報の表を消去します。
    while (infoTableHolder.firstChild) {
      infoTableHolder.removeChild(infoTableHolder.firstChild);
    }

    // ヘッダー行のみから成る表を追加します。
    const table = document.createElement("table");
    table.id = tableId;
    const header = document.createElement("tr");
    const dataLabelList = viewer.dataLabelList;
    for (const label of dataLabelList) {
      const th = document.createElement("th");
      th.textContent = label;
      header.appendChild(th);
    }
    table.appendChild(header);
    infoTableHolder.appendChild(table);
  }
}

/**
 * ビューワーで選択されている細胞の情報が変化した場合の
 * イベント ハンドラーを返します。
 *
 * @param {Viewer} viewer ビューワーです。
 * @param {HTMLElement} nSelectedIndicator 選択中の細胞の数を表示する要素です。
 * @return {function} ID が "info_table" である table に
 *     選択中の細胞の情報を表示するイベント ハンドラーです。
 */
function viewerOnSelectionChange(viewer, nSelectedIndicator) {

  return function (isShowingChart) {

    // 選択中の細胞数を表示します。
    nSelectedIndicator.textContent = `(${viewer.selectedCellList.length})`

    const table = document.getElementById(tableId);

    // 表がまだ作成されていなければ何もしません。
    if (table === null) {
      return;
    }

    // ヘッダー行以外を消去します。
    while (table.children.length > 1) {
      table.removeChild(table.children[1]);
    }

    // 選択された細胞がなければ終了します。
    if (!viewer.selectedCellList.length) {
      return;
    }

    // 選択中の細胞の情報を表に表示します。
    for (const iCell of viewer.selectedCellList) {

      // 行を追加します。
      const tr = document.createElement("tr");
      table.appendChild(tr);

      // 細胞の情報を取得します。
      const infoList = viewer.getSingleCellInfo(iCell);

      for (const info of infoList) {
        const td = document.createElement("td");
        td.textContent = info;
        tr.appendChild(td);
      }
    }

    // 統計量を計算します。
    const stats = viewer.getStatsOfSelection();

    // 統計量の情報を表に追加します。
    appendStats("Min.", stats.getMin);
    appendStats("Max.", stats.getMax);
    appendStats("Mean", stats.getMean);
    appendStats("Variance", stats.getVariance);
    appendStats("SD", stats.getSD);
    appendStats("CV", stats.getCV);


    // 統計量を表す列を表に追加する関数です。
    function appendStats(statsName, getStatsFunc) {

      const tr = document.createElement("tr");
      table.appendChild(tr);

      // スタイル シートを適用するためにクラス名を設定します。
      tr.className = statsClassName;

      for (const label of viewer.dataLabelList) {

        const td = document.createElement("td");
        tr.appendChild(td);

        // セルの値として統計量、算出できなければ "N/A"、
        // ID 列の場合は統計量の種類を書き込みます。
        td.textContent =
          stats.hasStatsOf(label) ? getStatsFunc(label) :
            label === idLabel ? statsName : "N/A";
      }
    }

    // グラフを表示します。
    if (isShowingChart) {

      // グラフ描画用の行を追加します。
      const tr = document.createElement("tr");
      table.appendChild(tr);

      // すべての列にわたるセルを作成します。
      const td = document.createElement("td");
      const cols = table.rows[0].cells.length;
      td.setAttribute("colSpan", cols);
      td.setAttribute("height", 200);
      tr.appendChild(td);

      // Chart 描画用の Canvas を作成します。
      const canvas = document.createElement("canvas");
      canvas.id = "chart";
      canvas.style.position = "relative";
      td.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      // Chart を描画します。
      viewer.drawChart(ctx);
      
    } else {

      // Chart をクリアします。
      viewer.resetChart();
    }

    table.parentElement.scrollTo(
      { top: table.parentElement.scrollHeight, behavior: "auto" }
    );
  }
}

/**
 * ファイル選択エリアにファイルがドロップされた場合の
 * イベント ハンドラーを返します。
 *
 * @param {function} callback 単一の File オブジェクトを受け取る
 *     コールバックです。
 * @return {function} ファイルの同時処理数やファイル選択用エリアの書式を
 *     制御しながら、引数のコールバックを実行するイベント ハンドラーです。
 */
function fileSelectorOndrop(callback) {

  return function (event) {
    event.preventDefault();
    this.style.backgroundColor = "";

    // ファイルの処理中だった場合です。
    if (isProcessingFile) {
      alertAnotherFile();
      this.style.backgroundColor = "";
      return;
    }

    const files = event.dataTransfer.files;

    // 複数のファイルが同時にドロップされた場合です。
    if (files.length > 1) {
      window.alert(multipleFileLoadMessage);
      this.style.backgroundColor = "";
      return;
    }

    isProcessingFile = true;
    callback(files[0]);
    isProcessingFile = false;
  }
}

/**
 * ファイル選択エリアがクリックされた場合の
 * イベント ハンドラーを返します。
 *
 * @param {HTMLElement} fileInput ファイル選択用の <input> 要素です。
 * @return {function} ファイルの同時処理数を制御しながら fileInput の
 *     click イベントを発火させるコールバックです。
 */
function fileSelectorOnclick(fileInput) {
  return function (event) {
    if (isProcessingFile) {
      alertAnotherFile();
      return;
    }
    fileInput.click();
  }
}

/**
 * ファイル選択用の <input> 要素の状態が変化した場合の
 * イベント ハンドラーを返します。
 *
 * @param {function} callback 単一の File オブジェクトを受け取る
 *     コールバックです。
 * @return {function} ファイルの同時処理数を制御しながら
 *     引数のコールバックを実行するイベント ハンドラーです。
 */
function fileInputOnchange(callback) {

  return function (event) {
    const files = event.target.files;
    isProcessingFile = true;
    callback(files[0]);
    isProcessingFile = false;
  }

}

/**
 * 別ファイルの処理が行われているのを警告します。
 *
 */
function alertAnotherFile() {
  window.alert(anotherFileProcessingMessage);
}

// セパレーターをドラッグしているか否かです。
let isDraggingLine = false;

/**
 * 描画領域の縦幅を変更できる機能をセパレーターに与えます。
 *
 * @param {HTMLElement} separator セパレーターです。
 * @param {HTMLElement} canvasHolder 描画領域です。
 */
function activateSeparator(separator, canvasHolder) {
  separator.addEventListener("mousedown", (event) => {
    isDraggingLine = true;
    event.preventDefault();
  });
  document.addEventListener("mousemove", (event) => {
    if (!isDraggingLine) return;
    const newHeight = canvasHolder.clientHeight + event.movementY;
    canvasHolder.style.height = newHeight + "px";
  });
  document.addEventListener("mouseup", () => {
    isDraggingLine = false;
  });
}

/**
 * テーブルの内容を CSV ファイルに保存します。
 */
function viewerOnSaveTableClick() {
  // テーブルを取得します。
  const table = document.getElementById(tableId);
  // テーブルが空の場合はメソッドを終了します。
  if (table === null) return;
  // CSV ファイルを保存します。
  var blob = new Blob([tableToCsv(table)], { type: "text/csv" });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  // 日時からファイル名を作成します。
  link.download = formatDateTime(new Date()) + "-selected_cells.csv";
  link.click();
}

/**
 * テーブルの内容を CSV 文字列に変換して返します。
 * 
 * @param {HTMLElement} table テーブルを渡します。
 */
function tableToCsv(table) {

  if (table === null) return null;

  var rows = getRows(table);
  var lines = [];
  var delimiter = ',';

  for (var i = 0, numOfRows = rows.length; i < numOfRows; i++) {
    var cols = getCols(rows[i]);
    var line = [];

    for (var j = 0, numOfCols = cols.length; j < numOfCols; j++) {
      var text = cols[j].textContent || cols[j].innerText;
      if (text.includes(',') || text.includes('"')) text = '"' + text.replace(/"/g, '""') + '"';
      line.push(text);
    }

    lines.push(line.join(delimiter));
  }

  return lines.join("\r\n")
}

function getRows(table) {
  return getNodesByName(table, 'tr');
}

function getCols(table) {
  return getNodesByName(table, ['td', 'th']);
}

function getNodesByName(element) {
  var children = element.childNodes;
  var nodeNames = ('string' === typeof arguments[1]) ? [arguments[1]] : arguments[1];
  nodeNames = nodeNames.map(function (str) { return str.toLowerCase() });

  var results = [];

  for (var i = 0, max = children.length; i < max; i++) {
    if (nodeNames.indexOf(children[i].nodeName.toLowerCase()) !== -1) {
      results.push(children[i]);
    }
    else {
      results = results.concat(this.getNodesByName(children[i], nodeNames));
    }
  }

  return results;
}

/**
 * 日時を日付文字列に変換する関数です。
 */
function formatDateTime(date) {
  const yyyy = date.getFullYear();
  const MM = ("0" + (date.getMonth() + 1)).slice(-2);
  const dd = ("0" + date.getDate()).slice(-2);
  const HH = ("0" + date.getHours()).slice(-2);
  const mm = ("0" + date.getMinutes()).slice(-2);
  const ss = ("0" + date.getSeconds()).slice(-2);
  return yyyy + MM + dd + "-" + HH + mm + ss;
}
