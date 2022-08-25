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
function viewerOnloaded(viewer, fileNameHolder, infoTableHolder) {

  return function()  {
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

  return function() {

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
    if (! viewer.selectedCellList.length) {
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

    table.parentElement.scrollTo(
      {top: table.parentElement.scrollHeight, behavior: "smooth"}
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

  return function(event) {
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
  return function(event) {
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

  return function(event) {
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
    if (! isDraggingLine) return;
    const newHeight = canvasHolder.clientHeight + event.movementY;
    canvasHolder.style.height = newHeight + "px";
  });
  document.addEventListener("mouseup", () => {
    isDraggingLine = false;
  });
}
