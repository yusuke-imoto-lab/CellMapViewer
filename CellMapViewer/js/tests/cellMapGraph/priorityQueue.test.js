const PriorityQueue = require("../../cellMapViewer/cellMapGraph/priorityQueue");


// enqueue メソッドと dequeue メソッドのテストです。
test("enqueue & dequeue", () => {
  const queue = new PriorityQueue();

  // 10 ～ 19 を順に追加します。
  for (let i = 10; i < 20; i++) {
    queue.enqueue(i.toString(), i);
  }
  // 9 ～ 0 を順に追加します。
  for (let i = 9; i >= 0; i--) {
    queue.enqueue(i.toString(), i);
  }
  // 0 ～ 20 の順で取り出されることを確認します。
  for (let i = 0; i < 20; i++) {
    expect(queue.dequeue()).toBe(i.toString());
  }
});
