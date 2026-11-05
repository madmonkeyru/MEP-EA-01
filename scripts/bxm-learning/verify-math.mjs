import assert from 'node:assert/strict';

/** Independent arithmetic/reference checks for this fixed editorial pack.
 * Qualitative checks verify the intended claim, not empirical pedagogy or certification.
 */
export function verifyAuthoredAnswers(items) {
  const correct = id => {
    const item = items.find(i => i.id === `bxm-authored-v1-${id}`);
    assert(item, `Missing ${id}`);
    return item.options[item.correctOption];
  };
  const normalized = text => text.replace(/\s|\$/g, '');
  const equal = (id, expected) => assert.equal(normalized(correct(id)), normalized(expected), `Wrong answer: ${id}`);
  equal('geo-001', `(x - 3)^2 + (y + 4)^2 = ${5 ** 2}`);
  equal('geo-002', `Centro $(-2, 7)$ y diámetro $${2 * Math.sqrt(49)}$`);
  equal('geo-003', `x^2+y^2=${3 ** 2 + 4 ** 2}`);
  assert.equal((3-1)**2+(2+2)**2, 20);
  assert.match(correct('geo-004'), /perteneciente/);
  assert.match(correct('geo-005'), /Una circunferencia/);
  equal('geo-006', `${Math.sqrt(10**2-6**2)}\\text{ cm}`);
  equal('geo-007', `${Math.sqrt(13**2-25)}\\text{ cm}`);
  assert.match(correct('geo-008'), /círculo congruente/);
  equal('geo-009', `(x - ${(-1+5)/2})^2 + (y - 2)^2 = ${((5+1)/2)**2}`);
  equal('geo-010', `${2*Math.sqrt((34/2)**2-15**2)}\\pi\\text{ cm}`);
  equal('func-001', `${(5+3)/(6-2)}`);
  equal('func-002', `(${12/3}, 0)`);
  equal('func-003', `y=-3x+${1-(-3)*2}`);
  equal('func-004', `y=-2x+${4-(-2)*(-1)}`);
  equal('func-005', `${Math.hypot(6/(3/4),6)}`);
  equal('func-006', 'y=-\\frac{5}{2}x+2');
  assert.match(correct('func-007'), /m < 0.*b = -4/);
  equal('func-008', '\\text{₡}5\\,000');
  assert.equal(15000-10*(30000-15000)/(25-10),5000);
  equal('func-009', `(${-15/(12/-4)}, -15)`);
  const mid = (0+6)/2; const slope = (8-0)/(4-mid);
  equal('func-010', `y=${slope}x-${slope*mid}`);
  equal('stat-001','80');
  equal('stat-002',`${6*15-5*14}`);
  equal('stat-003',`${68-42}`);
  assert.match(correct('stat-004'), /75/);
  assert.match(correct('stat-005'), /50.*80/);
  assert.match(correct('stat-006'), /negativa/);
  equal('stat-007',`${90*.2+80*.3+70*.5}`);
  assert(105 > 70+1.5*(70-50)); equal('stat-008','105');
  equal('stat-009', `${(36-18)-((25+28)/2-(19+20)/2)}`);
  assert.match(correct('stat-010'), /inferiores/);
  return 30;
}
