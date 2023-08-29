"use strict";

if (typeof require !== "undefined") {
  global.PriorityQueue = require("./priorityQueue");
  const errorConst = require("./graphErrorConst");
  global.floatPassedError = errorConst.floatPassedError;
  global.negativeNodeIndexError = errorConst.negativeNodeIndexError;
  global.nodeIndexTooLargeError = errorConst.nodeIndexTooLargeError;
  global.startGoalIdenticalError = errorConst.startGoalIdenticalError;
  global.registerValueError = errorConst.registerValueError;
  global.doesNotContainNodeError = errorConst.doesNotContainNodeError;
}


/**
 * グラフで経路探索を行うためのクラスです。
 *
 * @class PathFinder
 */
class PathFinder {

  /**
   * グラフ上の最短経路を探索します。
   *
   * @static
   * @param {Array<Array<Edge>>} edgeListArray 各頂点から伸びる辺の
   *     リストの配列です。
   * @param {number} iStartNode 経路の始点を表すノードのインデックスです。
   * @param {number} iGoalNode 経路の終点を表すノードのインデックスです。
   *     z 座標の低い方から高い方に向かう経路を除外して探索します。
   * @param {number} register 経路計算時の重みづけに用いるパラメーターです。
   * @return {{path: {Array<number>}, distance: number}} 
   *     始点から終点に至るまでの経路上のノードのインデックスの配列 (経路が存在しない場合は空の配列) と、
   *     その経路の距離 (経路が存在しない場合は null) をもつオブジェクトです。
   * @memberof PathFinder
   */
  static find = (edgeListArray, iStartNode, iGoalNode, register) => {

    // 次の場合はエラーとします。
    // 始点や終点の値が整数でない
    if (! Number.isInteger(iStartNode) || ! Number.isInteger(iGoalNode)) {
      throw floatPassedError;
    }
    // 始点や終点の値が負である
    if (iStartNode < 0 || iGoalNode < 0) {
      throw negativeNodeIndexError;
    }
    // 始点や終点の値がノードの数より大きい
    if (
      iStartNode >= edgeListArray.length || iGoalNode >= edgeListArray.length
    ) {
      throw nodeIndexTooLargeError;
    }
    // 始点と終点が一致している
    if (iStartNode === iGoalNode) {
      throw startGoalIdenticalError;
    }
    // register の値が 0 ~ 1 の範囲でない
    if (register === null || register === undefined || register < 0 || 1 < register) {
      throw registerValueError;
    }

    // 以下、Dijkstra 法で始点から終点への最短経路を探索します。

    // 探索対象のノードの優先度付きキューです。
    const nodeQueue = new PriorityQueue();

    // 優先度付きキューから取り出された、
    // 始点からの距離が最も短いノードの番号を後で格納する変数です。
    let iClosestNode = 0;

    // 現時点で判明している、始点から各ノードへの最短経路の重み付け長さのリストです。
    // ノード番号をキーにして距離を格納します。
    const minDistanceList = {};

    // 現時点で判明している、始点から各ノードへの最短経路における
    // 1 つ前のノードのリストです。
    // ノード番号をキーにして 1 つ前のノード番号を格納します。
    const previousNodeList = {};

    // 初期状態を構築します。
    for (let i = 0; i < edgeListArray.length; i++) {

      // 始点から始点への距離をゼロとします。
      if (i === iStartNode) {
        minDistanceList[iStartNode] = 0;
        nodeQueue.enqueue(iStartNode, 0);
      }
      // 始点からその他のノードへの距離を無限大とします。
      else {
        minDistanceList[i] = Infinity;
        nodeQueue.enqueue(i, Infinity);
      }

      // 各ノードへの最短経路は何も判明していない状態とします。
      previousNodeList[i] = null;
    }

    // 経路探索ループです。
    while (true) {

      // 優先度付きキューから、始点からの距離が最短のノードの番号を取り出します。
      iClosestNode = nodeQueue.dequeue();

      // 取り出されたノードへの始点からの距離が無限大、
      // すなわち始点を含む連結成分の探索が終了し、
      // 別の連結成分の探索が始まった場合です。
      // 経路は存在しないものとして、空のリストを返します。
      if (minDistanceList[iClosestNode] === Infinity) {
        return { path: [], distance: null };
      }

      // 取り出されたノードが終点と一致した場合、
      // 経路探索を終了します。
      if (iClosestNode === iGoalNode) {

        // 探索ループを抜ける前に、終点までへの経路をたどって
        // 始点から終点に至るまでの経路を逆順に構築します。
        // 最後で順番を逆にして始点から終点に至るまでの経路とします。
        const result= [iGoalNode];
        let currentNode = iGoalNode;
        while (previousNodeList[currentNode] !== null) {
          // このループは previousNodeList[currentNode] が null となった時点、
          // すなわち始点が結果に追加された時点で終了します。
          result.push(previousNodeList[currentNode]);
          currentNode = previousNodeList[currentNode];
        }
        // 始点以外を含む逆順の最短経路を逆順にして返します。
        return {path: result.reverse(), distance: minDistanceList[iGoalNode]};
      }

      // 取り出されたノードが終点ノードではない場合です。
      // そのノードに接続された辺をループします。
      for (const edge of edgeListArray[iClosestNode]) {
        // 無効な辺はスキップします。
        if (! edge.enabled) {
          continue;
        }

        // 辺の長さを取得します。
        const lenEdge = Math.sqrt(edge.len2dSquared);

        // 辺の先にある隣接ノードを取り出します。
        const nextNode = edge.getOppositeNode(iClosestNode);

        // 辺に重み付けする際の重みを求めます。
        let weight = null;
        // register が 0 の場合は重みはありません。
        if (register === 0){
          weight = 1;
        }
        // register が 0 でない場合は、辺の登りか下りかで、重みを変えます。
        else {
          const zDifference = Math.abs(edge.zDifference);
          weight = isLower(iClosestNode, edge) ? 
            Math.exp(zDifference * register) : Math.exp(- zDifference * register);
        }


        // 始点から現在のノードへの現時点での最短距離に、
        // 隣接ノードへの、重みを付けした辺の長さを足します。
        // 始点から隣接ノードへの新しい最短距離の候補となります。
        const minDistanceCandidate = minDistanceList[iClosestNode] + lenEdge * weight;

        // 始点から隣接ノードへの現時点での最短経路が、
        // 「始点―現在のノード―隣接ノード」という経路で更新できる場合です。
        if (minDistanceCandidate < minDistanceList[nextNode]) {

          // 始点から隣接ノードへの最短距離を更新します。
          minDistanceList[nextNode] = minDistanceCandidate;

          // 始点から隣接ノードに至る最短経路を更新します。
          previousNodeList[nextNode] = iClosestNode;

          // 探索対象のノードを更新します。
          nodeQueue.enqueue(nextNode, minDistanceCandidate);
        }
      }
    }

    // あるノードがその辺の z 座標の低い方であるかを判定します。
    function isLower(iNode, edge) {
      switch (edge.whichNodeIs(iNode)) {
        case 1:
          return edge.zDifference < 0;
        case 2:
          return edge.zDifference > 0;
        default:
          // ここに到達した場合、入力 edgeListArray の
          // インデックスと辺の対応が間違っています。
          throw doesNotContainNodeError(iNode);
      }
    }
  }
}

if (typeof module !== "undefined") {
  module.exports = PathFinder;
}
