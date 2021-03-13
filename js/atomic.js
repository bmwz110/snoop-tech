const workerScript = `
  self.onmessage = ({data}) => {
    const view = new Uint32Array(data);

    // 执行1000000次加操作
    for (let i = 0; i < 1E6; ++i) {
    // 线程不安全加操作会导致资源争用
    view[0] += 1;
    }

    self.postMessage(null);
  };
`;

let scriptBlob = new Blob([workerScript]);
const workerScriptBlobUrl = URL.createObjectURL(scriptBlob);

// 创建容量为 4 的工作线程池
const workers = [];
for (let i = 0; i < 4; ++i) {
  workers.push(new Worker(workerScriptBlobUrl)); 
}

// 在最后一个工作线程完成后打印出最终值 let responseCount = 0;
for (const worker of workers) {
  worker.onmessage = () => {
    if (++responseCount == workers.length) {
      console.log(`Final buffer value: ${view[0]}`);
    }
  };
}

// 初始化SharedArrayBuffer
const sharedArrayBuffer = new SharedArrayBuffer(4);
const view = new Uint32Array(sharedArrayBuffer);
view[0] = 1;

// 把 SharedArrayBuffer 发送到每个工作线程
for (const worker of workers) {
  worker.postMessage(sharedArrayBuffer);
}
//(期待结果为 4000001。实际输出可能类似这样:) // Final buffer value: 2145106
