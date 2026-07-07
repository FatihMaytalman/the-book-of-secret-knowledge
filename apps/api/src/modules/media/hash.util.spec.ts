import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import { sha256Hex } from './hash.util';

describe('sha256Hex', () => {
  it('returns a lowercase SHA-256 hex digest for a buffer', () => {
    const input = Buffer.from('family-tree-memory');
    const expected = createHash('sha256').update(input).digest('hex');

    assert.equal(sha256Hex(input), expected);
    assert.match(sha256Hex(input), /^[a-f0-9]{64}$/);
  });
});
