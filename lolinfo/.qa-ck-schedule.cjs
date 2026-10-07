const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
    const tabs = await fetch('http://127.0.0.1:9333/json').then(r => r.json());
    const socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let id = 0;
    const pending = new Map();
    const requests = [];
    let scheduleFailure = false;
    let homeMode = 'ready';
    let board = { boardId: 101, boardCategory: 'CK 예정', boardTitle: '테스트 CK', boardContent: '테스트 내용', boardWriter: 'qa', boardWtime: '2026-10-07T12:00:00' };
    let schedule = { boardId: 101, ckDate: '2026-10-10T20:00:00', ckUrl: 'https://example.com' };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
        const requestId = ++id;
        pending.set(requestId, { resolve, reject });
        socket.send(JSON.stringify({ id: requestId, method, params }));
    });
    socket.onmessage = async ({ data }) => {
        const message = JSON.parse(data);
        if (message.id) {
            const p = pending.get(message.id);
            pending.delete(message.id);
            if (message.error) p.reject(new Error(JSON.stringify(message.error))); else p.resolve(message.result);
        } else if (message.method === 'Fetch.requestPaused') {
            const { requestId, request } = message.params;
            const url = new URL(request.url);
            if (url.origin === 'http://127.0.0.1:5173') {
                await send('Fetch.continueRequest', { requestId });
                return;
            }
            let body = null;
            let responseCode = 200;
            if (url.pathname.startsWith('/api/')) {
                requests.push(request);
                if (request.method === 'OPTIONS') body = null;
                else if (url.pathname === '/api/ck/schedule/home') {
                    responseCode = homeMode === 'error' ? 500 : 200;
                    body = homeMode === 'empty' ? [] : [
                        { ...board, ...schedule, boardId: 101, boardTitle: '아주 긴 CK 제목 '.repeat(12), boardContent: '<p>요약 내용</p>\n'.repeat(40) },
                        { ...board, boardId: 102, ckDate: '2026-10-12T21:00:00', ckUrl: null },
                        { ...board, boardId: 103, ckDate: '2026-10-13T21:00:00', ckUrl: null },
                    ];
                } else if (url.pathname === '/api/ck/schedule/101') {
                    body = schedule;
                    if (scheduleFailure) responseCode = 500;
                } else if (url.pathname === '/api/board/101') {
                    body = board;
                    if (request.method === 'DELETE') { schedule = null; body = null; }
                } else if (url.pathname === '/api/board/') {
                    if (['POST', 'PUT'].includes(request.method)) {
                        const payload = JSON.parse(request.postData);
                        board = { ...board, ...payload.board };
                        schedule = payload.schedule;
                    }
                    body = request.method === 'GET' ? [] : null;
                } else if (url.pathname.includes('/stat')) body = {};
                else body = [];
            }
            await send('Fetch.fulfillRequest', {
                requestId, responseCode,
                responseHeaders: [
                    { name: 'Content-Type', value: 'application/json' },
                    { name: 'Access-Control-Allow-Origin', value: '*' },
                    { name: 'Access-Control-Allow-Headers', value: '*' },
                    { name: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
                ], body: Buffer.from(body == null ? '' : JSON.stringify(body)).toString('base64'),
            });
        }
    };
    const evaluate = async expression => {
        const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
        return r.result.value;
    };
    const wait = async expression => {
        for (let i = 0; i < 100; i++) {
            if (await evaluate(expression)) return;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        throw new Error('Timeout: ' + expression);
    };
    const go = async path => {
        await send('Page.navigate', { url: 'http://127.0.0.1:5173' + path });
        await wait('document.querySelector("#root")?.children.length > 0');
    };
    const set = (selector, value) => evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set.call(e, ${JSON.stringify(value)}); e.dispatchEvent(new Event(e.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); })()`);
    const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    const confirm = async () => { await wait('!!document.querySelector(".swal2-confirm")'); await click('.swal2-confirm'); };
    const lastWrite = method => requests.filter(r => r.method === method && r.url.endsWith('/board/')).at(-1);
    await send('Page.enable');
    await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `sessionStorage.setItem('loginIdState', JSON.stringify('qa')); sessionStorage.setItem('loginLevelState', JSON.stringify('일반')); sessionStorage.setItem('accessTokenState', JSON.stringify('qa-token'));` });
    try {
        await go('/board/write');
        await wait('!!document.querySelector("[name=boardTitle]")');
        assert.equal(await evaluate('!!document.querySelector("[name=ckDate]")'), false);
        await set('[name=boardTitle]', '일반 글'); await set('[name=boardContent]', '내용');
        await click('button[type=submit]'); await confirm();
        assert.equal(JSON.parse(lastWrite('POST').postData).schedule, null);
        assert.equal(lastWrite('POST').headers.Authorization, 'Bearer qa-token');
        console.log('PASS 일반 등록 wrapper / Authorization');

        await go('/board/write'); await wait('!!document.querySelector("[name=boardTitle]")');
        await set('[name=boardCategory]', 'CK 예정');
        await set('[name=boardTitle]', 'CK 예정'); await set('[name=boardContent]', '내용');
        assert.equal(await evaluate('document.querySelector("[name=ckDate]").checkValidity()'), false);
        await set('[name=ckDate]', '2026-10-10T20:00');
        await click('button[type=submit]'); await confirm();
        assert.deepEqual(JSON.parse(lastWrite('POST').postData).schedule, { ckDate: '2026-10-10T20:00:00', ckUrl: null });
        console.log('PASS CK 등록 / 필수 날짜 / 빈 URL');

        await go('/board/101'); await wait('!!document.querySelector(".board-detail-footer .btn-primary")');
        await click('.board-detail-footer .btn-primary'); await wait('!!document.querySelector("[name=ckDate]")');
        assert.equal(await evaluate('document.querySelector("[name=ckDate]").value'), '2026-10-10T20:00');
        await set('[name=boardTitle]', 'CK 수정'); await set('[name=ckDate]', '2026-10-12T21:00'); await set('[name=ckUrl]', 'https://example.com/new');
        await click('button[type=submit]'); await confirm();
        assert.deepEqual(JSON.parse(lastWrite('PUT').postData).schedule, { boardId: 101, ckDate: '2026-10-12T21:00:00', ckUrl: 'https://example.com/new' });
        console.log('PASS CK 수정 / 단건 조회 / 초 제거');

        await wait('!!document.querySelector(".board-detail-footer .btn-primary")');
        await click('.board-detail-footer .btn-primary'); await wait('!!document.querySelector("[name=ckDate]")');
        await set('[name=boardCategory]', '자유'); await click('button[type=submit]'); await confirm();
        assert.equal(JSON.parse(lastWrite('PUT').postData).schedule, null);
        console.log('PASS CK → 일반');

        await wait('!!document.querySelector(".board-detail-footer .btn-primary")');
        await click('.board-detail-footer .btn-primary'); await wait('!!document.querySelector("#board-edit-category")');
        assert.equal(await evaluate('!!document.querySelector("[name=ckDate]")'), false);
        await click('button[type=submit]'); await confirm();
        assert.equal(JSON.parse(lastWrite('PUT').postData).schedule, null);
        console.log('PASS 일반 수정 / 빈 일정 응답');

        await wait('!!document.querySelector(".board-detail-footer .btn-primary")');
        await click('.board-detail-footer .btn-primary'); await wait('!!document.querySelector("#board-edit-category")');
        await set('[name=boardCategory]', 'CK 예정'); await set('[name=ckDate]', '2026-10-10T20:00');
        await click('button[type=submit]'); await confirm();
        assert.equal(JSON.parse(lastWrite('PUT').postData).schedule.boardId, 101);
        console.log('PASS 일반 → CK');

        scheduleFailure = true;
        await wait('!!document.querySelector(".board-detail-footer .btn-primary")');
        await click('.board-detail-footer .btn-primary'); await confirm();
        assert.equal(await evaluate('!!document.querySelector("#board-edit-category")'), false);
        scheduleFailure = false;
        console.log('PASS 일정 조회 실패 시 수정 차단');

        await go('/'); await wait('document.querySelectorAll(".home-ck-schedule-card").length === 3');
        assert.equal(await evaluate('document.querySelectorAll(".home-ck-schedule a[target=_blank]").length'), 0);
        assert.equal(await evaluate('document.querySelector(".home-ck-schedule-card h3 a").getAttribute("href")'), '/board/101');
        assert.equal(requests.filter(r => r.method === 'GET' && r.url.endsWith('/ck/schedule/home')).length, 1);
        for (const width of [1440, 390, 320]) {
            await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
            const result = await evaluate(`(() => { const section = document.querySelector('.home-ck-schedule'); return { width: innerWidth, overflow: section.scrollWidth > section.clientWidth, columns: getComputedStyle(section.querySelector('.home-ck-schedule-grid')).gridTemplateColumns.split(' ').length, clamp: getComputedStyle(section.querySelector('.home-ck-schedule-preview')).webkitLineClamp }; })()`);
            assert.equal(result.overflow, false); assert.equal(result.columns, width < 768 ? 1 : 3); assert.equal(result.clamp, '2');
            console.log('PASS 홈 반응형', JSON.stringify(result));
        }
        homeMode = 'empty'; await go('/'); await wait('document.querySelector(".home-ck-schedule")?.textContent.includes("현재 등록된 예정 CK가 없습니다.")');
        homeMode = 'error'; await go('/'); await wait('!!document.querySelector(".home-ck-schedule [role=alert]")');
        assert.equal(await evaluate('!!document.querySelector(".home-hero") && !!document.querySelector(".home-features")'), true);
        console.log('PASS 홈 빈 결과 / 오류 격리');
        homeMode = 'ready'; schedule.ckUrl = 'https://example.com';
        await go('/'); await wait('!!document.querySelector(".home-ck-schedule a[target=_blank]")');
        assert.equal(await evaluate('document.querySelector(".home-ck-schedule a[target=_blank]").rel'), 'noopener noreferrer');
        console.log('PASS 외부 링크 조건부 표시');
        await evaluate('document.querySelector(".home-ck-schedule").scrollIntoView()');
        const shot = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync('.qa-ck-mobile.png', Buffer.from(shot.data, 'base64'));
        await go('/board/101'); await wait('!!document.querySelector(".board-detail-footer .btn-danger")');
        await click('.board-detail-footer .btn-danger'); await confirm(); await confirm();
        assert.equal(requests.some(r => r.method === 'DELETE' && r.url.endsWith('/board/101')), true);
        console.log('PASS 기존 삭제 요청');
    } finally {
        socket.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
