"use strict";


/**
 * 優先度付きキューを表すクラスです。
 * 優先度の値が小さい要素から取り出されます。
 *
 * @class PriorityQueue
 */
class PriorityQueue {

  // 優先度付きキューの内部表現となるヒープを表すリストです。
  #nodeList;

  /**
   * コンストラクターです。空の優先度付きキューを生成します。
   * @memberof PriorityQueue
   */
  constructor() {
    this.#nodeList = [];
  }

  /**
   * 要素を追加します。
   *
   * @param {object} element 追加する要素です。
   * @param {number} priority 追加する要素の優先度です。
   * @memberof PriorityQueue
   */
  enqueue = (element, priority) => {
    const node = {element: element, priority: priority};
    this.#nodeList.push(node);
    this.#bubbleUp();
  }

  /**
   * 内部表現のヒープの末尾にある要素を、
   * ヒープ性を維持するように先祖と入れ替えていきます。
   *
   * @memberof PriorityQueue
   */
  #bubbleUp = () => {

    // 親との入れ替えを検討するノードを表すインデックスとオブジェクトです。
    // 最初はヒープの末尾にある要素とします。
    let iNodeToBubbleUp = this.#nodeList.length - 1;
    const nodeToBubbleUp = this.#nodeList[iNodeToBubbleUp];

    // 入れ替えを検討する親が存在する限りループします。
    while (iNodeToBubbleUp > 0) {

      // 親ノードを表すインデックスとオブジェクトを取得します。
      const parentNodeIdx = Math.floor((iNodeToBubbleUp - 1) / 2);
      const parentNode = this.#nodeList[parentNodeIdx];

      // 優先度の値を比較し、親のそれより小さくなければループを抜け、
      // それ以上入れ替えません。
      if (nodeToBubbleUp.priority >= parentNode.priority) {
        break;
      }

      // ループを抜けない場合、親ノードと入れ替えます。
      this.#nodeList[parentNodeIdx] = nodeToBubbleUp;
      this.#nodeList[iNodeToBubbleUp] = parentNode;
      // 入れ替えた後のインデックスを取得してループの次の周に移ります。
      iNodeToBubbleUp = parentNodeIdx;
    }
  }

  /**
   * 最も優先度の値の小さい要素を取り出します。
   * 要素はキューからは削除されます。
   *
   * @return {object} 取り出された要素です。
   * @memberof PriorityQueue
   */
  dequeue = () => {

    const topNode = this.#nodeList[0];
    const endNode = this.#nodeList.pop();

    // まだ要素が残っている場合です。
    if (this.#nodeList.length > 0) {
      this.#nodeList[0] = endNode;
      this.#sinkDown();
    }

    return topNode.element;
  }

  /**
   * 内部表現のヒープの根にある要素を、
   * ヒープ性を維持するように子孫と入れ替えていきます。
   *
   * @memberof PriorityQueue
   */
  #sinkDown = () => {

    // ヒープのノード数を取得しておきます。
    // 子ノードの存否の判定に用います。
    const length = this.#nodeList.length;

    // 子との入れ替えを検討する対象となるノードを表す
    // インデックスとオブジェクトです。
    // 最初は根ノードとします。
    let iNodeToSinkDown = 0;
    const nodeToSinkDown = this.#nodeList[iNodeToSinkDown];

    // 入れ替える必要がなくなるまでループします。
    while (true) {

      // 子ノードを表すインデックスを (子ノードが存在しなくても) 取得します。
      const iLeftChildNode = 2 * iNodeToSinkDown + 1;
      const iRightChildNode = 2 * iNodeToSinkDown + 2;

      // 子ノードを格納する変数です。
      let leftChildNode = null;
      let rightChildNode = null;

      // 入れ替え対象の子ノードを格納する変数です。
      let iNodeToSwap = null;

      // 左の子ノードが存在する場合です。
      if (iLeftChildNode < length) {

        // 優先度の値を比較し、左の子のそれの方が小さければ、
        // 右の子が存在しない限り、左の子を入れ替え対象とします。
        leftChildNode = this.#nodeList[iLeftChildNode];
        if (leftChildNode.priority < nodeToSinkDown.priority) {
          iNodeToSwap = iLeftChildNode;
        }
      }

      // 右の子ノードが存在する場合です。
      if (iRightChildNode < length) {

        // 左の子は入れ替え対象たりえなかったものの
        // 右の子と優先度の値を比較すると右の子が入れ替え対象となる場合、
        // または、
        // 左の子は入れ替え対象たりえたが優先度の値を比較した結果
        // 右の子と入れ替える場合です。
        rightChildNode = this.#nodeList[iRightChildNode];
        if (
          (iNodeToSwap === null &&
            rightChildNode.priority < nodeToSinkDown.priority) ||
          (iNodeToSwap !== null &&
            rightChildNode.priority < leftChildNode.priority)
        ) {
          iNodeToSwap = iRightChildNode;
        }
      }

      // 左の子とも右の子とも入れ替えられない場合はループを抜けます。
      if (iNodeToSwap === null) {
        break;
      }

      // 左の子か右の子と入れ替えることになった場合です。
      this.#nodeList[iNodeToSinkDown] = this.#nodeList[iNodeToSwap];
      this.#nodeList[iNodeToSwap] = nodeToSinkDown;
      // 入れ替えた後のインデックスを取得してループの次の周に移ります。
      iNodeToSinkDown = iNodeToSwap;
    }
  }
}

if (typeof module !== "undefined") {
  module.exports = PriorityQueue;
}
