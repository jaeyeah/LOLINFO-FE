(async () => {
const tabs = await fetch('http://127.0.0.1:9222/json').then((response) => response.json());
const tab = tabs.find((item) => item.type === 'page' && item.url.includes('127.0.0.1:5173'));
if (!tab) throw new Error('Home tab not found');
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let nextId = 0;
const pending = new Map();
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id) return;
  const callback = pending.get(message.id);
  pending.delete(message.id);
  callback(message);
};
const send = (method, params = {}) => new Promise((resolve) => {
  const id = ++nextId;
  pending.set(id, resolve);
  socket.send(JSON.stringify({ id, method, params }));
});
const expression = `(() => {
  const rect = (element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  };
  const ads = [...document.querySelectorAll('.home-side-ad')].map((ad) => {
    const label = ad.querySelector('.home-side-ad-label');
    const frame = ad.querySelector('iframe');
    const notice = ad.querySelector('.home-side-ad-disclosure');
    const style = getComputedStyle(notice);
    return {
      ad: rect(ad), label: rect(label), frame: rect(frame), notice: rect(notice),
      noticeText: notice.textContent.trim(), noticeScrollHeight: notice.scrollHeight,
      noticeClientHeight: notice.clientHeight, fontSize: style.fontSize,
      lineHeight: style.lineHeight, color: style.color,
    };
  });
  return { innerWidth, scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    home: rect(document.querySelector('.home-page')), ads };
})()`;
for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844], ['small-mobile', 320, 700], ['zoom200', 720, 900]]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await new Promise((resolve) => setTimeout(resolve, 500));
  const result = await send('Runtime.evaluate', { expression, returnByValue: true });
  console.log(name, JSON.stringify(result.result.result.value));
}
socket.close();
})().catch((error) => { console.error(error); process.exitCode = 1; });
