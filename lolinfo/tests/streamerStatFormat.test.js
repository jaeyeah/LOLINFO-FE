import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRate, formatChange } from '../src/components/streamer/streamerStatFormat.js';
test('rate display distinguishes no data and zero wins', () => {
    assert.equal(formatRate(null), '데이터 없음');
    assert.equal(formatRate(0), '0.0%');
    assert.equal(formatRate(600 / 13), '46.2%');
});
test('percentage-point changes round only after subtracting unrounded rates', () => {
    assert.equal(formatChange(1000 / 18 - 600 / 13), '+9.4%p');
    assert.equal(formatChange(600 / 13 - 62.5), '-16.3%p');
    assert.equal(formatChange(0), '0.0%p');
    assert.equal(formatChange(-0.01), '0.0%p');
    assert.equal(formatChange(null), '—');
});
