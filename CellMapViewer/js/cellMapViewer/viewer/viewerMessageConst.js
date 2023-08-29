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

// ベクトル データがない場合に、ストリームライン表示を on に指定された場合のメッセージです。
const cannotShowStreamlineMessage = 'Streamline can be shown when vector data exists.'

// 等高線の本数として正の整数以外が指定された場合のメッセージです。
const invalidContourNumberMessage = 'Number of contours shoud be positive integer.'


