"use strict";


// Viewer クラスで表示するメッセージを定義しています。

// 経路が既に表示されているときに経路探索を試みた際のメッセージです。
const pathAlreadyShownMessage = "Path is already shown.";

// グラフやジオメトリが存在しないとき、
// 細胞が 2 個選択されていないときに経路探索を試みた際のメッセージです。
const cannotFindPathMessage =
  "Path can be found only when exactly 2 cells are selected on the map.";

// 経路探索を試みたものの経路が見つからなかった場合のメッセージです。
const pathDoesNotExistMessage =
  "Path does not exist.";

// 想定外のエラーが出た際のメッセージです。
const unexpectedErrorMessage =
  "Unable to read or visualize input data due to an unexpected error:";
