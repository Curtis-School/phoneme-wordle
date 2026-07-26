import type { Phoneme, WordleConfig } from "@/lib/types";
import { renderDocument, serializeData } from "./shell";

const GAME_STYLES = `
.board { display: flex; flex-direction: column; gap: 6px; }
.row { display: flex; gap: 6px; }
.tile {
  position: relative;
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border); border-radius: 8px;
  background: var(--surface); color: var(--foreground);
  font-weight: 600; font-size: 1rem; user-select: none;
}
.tile.correct { background: var(--correct); color: var(--correct-foreground); border-color: var(--correct); }
.tile.present { background: var(--present); color: var(--present-foreground); border-color: var(--present); }
.tile.absent { background: var(--absent); color: var(--absent-foreground); border-color: var(--absent); }
.glyph { transition: opacity 0.15s ease; }
.reveal {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; text-transform: uppercase; transition: opacity 0.15s ease;
}
.tile:hover .glyph, .key:hover .glyph { opacity: 0; }
.tile:hover .reveal, .key:hover .reveal { opacity: 1; }
.message { min-height: 24px; font-weight: 600; }
.keyboard { display: flex; align-items: flex-start; justify-content: center; gap: 6px; }
.keys { display: flex; flex-direction: column; gap: 6px; }
.keyrow { display: flex; gap: 6px; justify-content: center; }
.actions { display: flex; flex-direction: column; gap: 6px; }
.key {
  position: relative;
  min-width: 44px; height: 48px; padding: 0 12px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--border); border-radius: 8px;
  background: var(--surface); color: var(--foreground);
  font-weight: 600; font-size: 0.9rem; cursor: pointer;
}
.key.action { background: var(--surface-muted); min-width: 64px; }
.key:hover { border-color: var(--primary); }
`;

const GAME_SCRIPT = `
(function () {
  var answer = DATA.answer, labels = DATA.labels, english = DATA.english, rows = DATA.rows, len = DATA.len;
  var guesses = [], current = [], done = false;
  var boardEl = document.getElementById('board');
  var msgEl = document.getElementById('message');
  var kbEl = document.getElementById('keyboard');

  function evaluate(guess, ans) {
    var states = guess.map(function () { return 'absent'; });
    var remaining = {};
    ans.forEach(function (id) { remaining[id] = (remaining[id] || 0) + 1; });
    guess.forEach(function (id, i) {
      if (ans[i] === id) { states[i] = 'correct'; remaining[id] = remaining[id] - 1; }
    });
    guess.forEach(function (id, i) {
      if (states[i] === 'correct') return;
      if ((remaining[id] || 0) > 0) { states[i] = 'present'; remaining[id] = remaining[id] - 1; }
    });
    return states;
  }

  function render() {
    boardEl.innerHTML = '';
    for (var r = 0; r < rows; r++) {
      var rowEl = document.createElement('div');
      rowEl.className = 'row';
      var guess = guesses[r];
      var states = guess ? evaluate(guess, answer) : null;
      for (var c = 0; c < len; c++) {
        var tile = document.createElement('div');
        tile.className = 'tile';
        var id = guess ? guess[c] : (r === guesses.length ? current[c] : undefined);
        if (id) {
          var glyph = document.createElement('span');
          glyph.className = 'glyph';
          glyph.textContent = id;
          tile.appendChild(glyph);
          var rev = document.createElement('span');
          rev.className = 'reveal';
          rev.textContent = english[id] || labels[id] || id;
          tile.appendChild(rev);
        }
        if (states) tile.className += ' ' + states[c];
        rowEl.appendChild(tile);
      }
      boardEl.appendChild(rowEl);
    }
  }

  function submit() {
    if (done) return;
    if (current.length !== len) { msgEl.textContent = 'Fill all sounds'; return; }
    guesses.push(current.slice());
    var states = evaluate(current, answer);
    current = [];
    render();
    if (states.every(function (s) { return s === 'correct'; })) { done = true; msgEl.textContent = 'Solved!'; }
    else if (guesses.length >= rows) {
      done = true;
      msgEl.textContent = 'Answer: ' + answer.map(function (id) { return labels[id] || id; }).join(' ');
    } else { msgEl.textContent = ''; }
  }

  function press(id) { if (done) return; if (current.length < len) { current.push(id); msgEl.textContent = ''; render(); } }
  function backspace() { if (done) return; current.pop(); render(); }

  var kb = DATA.keyboard;
  var half = Math.ceil(kb.length / 2);
  var keysWrap = document.createElement('div');
  keysWrap.className = 'keys';
  [[0, half], [half, kb.length]].forEach(function (range) {
    var rowEl = document.createElement('div');
    rowEl.className = 'keyrow';
    kb.slice(range[0], range[1]).forEach(function (k) {
      var b = document.createElement('button');
      b.className = 'key'; b.type = 'button';
      b.title = k.label + ' (' + k.example + ')';
      var glyph = document.createElement('span');
      glyph.className = 'glyph'; glyph.textContent = k.ipa;
      b.appendChild(glyph);
      var rev = document.createElement('span');
      rev.className = 'reveal'; rev.textContent = k.english;
      b.appendChild(rev);
      b.addEventListener('click', function () { press(k.ipa); });
      rowEl.appendChild(b);
    });
    keysWrap.appendChild(rowEl);
  });
  kbEl.appendChild(keysWrap);

  var actions = document.createElement('div');
  actions.className = 'actions';
  var del = document.createElement('button');
  del.className = 'key action'; del.type = 'button'; del.textContent = 'Del';
  del.addEventListener('click', backspace);
  actions.appendChild(del);
  var ent = document.createElement('button');
  ent.className = 'key action'; ent.type = 'button'; ent.textContent = 'Enter';
  ent.addEventListener('click', submit);
  actions.appendChild(ent);
  kbEl.appendChild(actions);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') submit();
    else if (e.key === 'Backspace') backspace();
  });

  render();
})();
`;

export function buildWordleHtml(
  config: WordleConfig,
  keyboard: readonly Phoneme[],
): string {
  const labels: Record<string, string> = {};
  const english: Record<string, string> = {};
  for (const phoneme of [...config.word, ...keyboard]) {
    labels[phoneme.ipa] = phoneme.label;
    english[phoneme.ipa] = phoneme.english;
  }

  const data = {
    answer: config.word.map((phoneme) => phoneme.ipa),
    labels,
    english,
    keyboard: keyboard.map((phoneme) => ({
      ipa: phoneme.ipa,
      english: phoneme.english,
      label: phoneme.label,
      example: phoneme.example,
    })),
    rows: config.maxGuesses,
    len: config.word.length,
  };

  const bodyHtml = `
<h1>Phoneme Wordle</h1>
<p class="subtitle">Guess the ${config.word.length}-sound word using the phoneme keys.</p>
<div class="message" id="message" role="status" aria-live="polite"></div>
<div class="board" id="board"></div>
<div class="keyboard" id="keyboard"></div>`;

  const script = `var DATA = ${serializeData(data)};${GAME_SCRIPT}`;

  return renderDocument({
    title: `Phoneme Wordle — ${config.englishWord}`,
    styles: GAME_STYLES,
    bodyHtml,
    script,
  });
}
