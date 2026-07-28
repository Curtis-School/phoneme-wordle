import type { Phoneme, PhonemeWord } from "@/lib/types";
import type { GeneratedWordSearch } from "@/lib/wordsearch";
import { escapeHtml, renderDocument, serializeData } from "./shell";

const GAME_STYLES = `
.status { min-height: 24px; font-weight: 600; }
.grid { display: grid; gap: 4px; touch-action: none; user-select: none; }
.cell {
  position: relative;
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border); border-radius: 6px;
  background: var(--surface-muted); color: var(--muted);
  font-weight: 600; font-size: 0.78rem; cursor: pointer;
}
.cell.present { background: var(--present); color: var(--present-foreground); border-color: var(--present); }
.cell.correct { background: var(--correct); color: var(--correct-foreground); border-color: var(--correct); }
.glyph { transition: opacity 0.15s ease; }
.reveal {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; text-transform: uppercase; transition: opacity 0.15s ease;
}
.cell:hover .glyph, .chip:hover .glyph { opacity: 0; }
.cell:hover .reveal, .chip:hover .reveal { opacity: 1; }
.clues { list-style: none; display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 360px; }
.clue { display: flex; align-items: center; gap: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); padding: 8px 12px; }
.clue.done { opacity: 0.6; }
.clue.done .clue-name { text-decoration: line-through; }
.clue-name { min-width: 64px; font-weight: 600; }
.strip { display: flex; flex-wrap: wrap; gap: 4px; }
.chip {
  position: relative;
  min-width: 26px; height: 26px; padding: 0 6px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--border); border-radius: 6px;
  background: var(--surface); font-size: 0.72rem; font-weight: 600;
}
.clue.done .chip { background: var(--correct); color: var(--correct-foreground); border-color: var(--correct); }
`;

const GAME_SCRIPT = `
(function () {
  var size = DATA.size, grid = DATA.grid, placements = DATA.placements, words = DATA.words;
  var found = [], start = null, selection = [];
  var gridEl = document.getElementById('grid');
  var statusEl = document.getElementById('status');
  var cluesEl = document.getElementById('clues');
  var cellEls = {};

  function key(c) { return c.row + ',' + c.col; }

  function lineBetween(a, b) {
    var dr = b.row - a.row, dc = b.col - a.col;
    var sr = Math.abs(dr), sc = Math.abs(dc);
    if (!(dr === 0 || dc === 0 || sr === sc)) return null;
    var len = Math.max(sr, sc), stepR = Math.sign(dr), stepC = Math.sign(dc);
    var cells = [];
    for (var i = 0; i <= len; i++) cells.push({ row: a.row + stepR * i, col: a.col + stepC * i });
    return cells;
  }

  function sameCells(a, b) {
    if (a.length !== b.length) return false;
    var fwd = a.every(function (c, i) { return c.row === b[i].row && c.col === b[i].col; });
    if (fwd) return true;
    return a.every(function (c, i) { var j = b.length - 1 - i; return c.row === b[j].row && c.col === b[j].col; });
  }

  function matchesPlacement(path) {
    for (var i = 0; i < placements.length; i++) if (sameCells(path, placements[i].cells)) return placements[i];
    return null;
  }

  function paint() {
    var fk = {};
    placements.forEach(function (p) {
      if (found.indexOf(p.english) !== -1) p.cells.forEach(function (c) { fk[key(c)] = true; });
    });
    var sel = {};
    selection.forEach(function (c) { sel[key(c)] = true; });
    Object.keys(cellEls).forEach(function (k) {
      cellEls[k].className = 'cell' + (fk[k] ? ' correct' : (sel[k] ? ' present' : ''));
    });
    statusEl.textContent = found.length === words.length ? 'All words found!' : (found.length + ' of ' + words.length + ' found');
    Array.prototype.forEach.call(cluesEl.children, function (li) {
      li.className = found.indexOf(li.getAttribute('data-word')) !== -1 ? 'clue done' : 'clue';
    });
  }

  function cellFromPoint(x, y) {
    var el = document.elementFromPoint(x, y);
    var t = el && el.closest ? el.closest('[data-cell]') : null;
    if (!t) return null;
    return { row: Number(t.getAttribute('data-row')), col: Number(t.getAttribute('data-col')) };
  }

  gridEl.style.gridTemplateColumns = 'repeat(' + size + ', minmax(0, 1fr))';
  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      var cellEl = document.createElement('div');
      cellEl.className = 'cell';
      cellEl.setAttribute('data-cell', '');
      cellEl.setAttribute('data-row', r);
      cellEl.setAttribute('data-col', c);
      var cellGlyph = document.createElement('span');
      cellGlyph.className = 'glyph'; cellGlyph.textContent = grid[r][c].ipa;
      cellEl.appendChild(cellGlyph);
      var cellRev = document.createElement('span');
      cellRev.className = 'reveal'; cellRev.textContent = grid[r][c].english;
      cellEl.appendChild(cellRev);
      gridEl.appendChild(cellEl);
      cellEls[r + ',' + c] = cellEl;
    }
  }

  words.forEach(function (w) {
    var li = document.createElement('li');
    li.className = 'clue';
    li.setAttribute('data-word', w.english);
    var name = document.createElement('span');
    name.className = 'clue-name'; name.textContent = w.english;
    li.appendChild(name);
    var strip = document.createElement('span');
    strip.className = 'strip';
    w.phonemes.forEach(function (ph) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      var chipGlyph = document.createElement('span');
      chipGlyph.className = 'glyph'; chipGlyph.textContent = ph.ipa;
      chip.appendChild(chipGlyph);
      var chipRev = document.createElement('span');
      chipRev.className = 'reveal'; chipRev.textContent = ph.english;
      chip.appendChild(chipRev);
      strip.appendChild(chip);
    });
    li.appendChild(strip);
    cluesEl.appendChild(li);
  });

  function down(e) {
    var cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    start = cell; selection = [cell];
    gridEl.setPointerCapture(e.pointerId);
    paint();
  }
  function move(e) {
    if (!start) return;
    var cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    selection = lineBetween(start, cell) || [start];
    paint();
  }
  function up() {
    if (!start) return;
    var m = matchesPlacement(selection);
    if (m && found.indexOf(m.english) === -1) found.push(m.english);
    start = null; selection = [];
    paint();
  }

  gridEl.addEventListener('pointerdown', down);
  gridEl.addEventListener('pointermove', move);
  gridEl.addEventListener('pointerup', up);
  gridEl.addEventListener('pointercancel', up);

  paint();
})();
`;

export function buildWordSearchHtml(
  phoneme: Phoneme,
  words: readonly PhonemeWord[],
  puzzle: GeneratedWordSearch,
): string {
  const data = {
    size: puzzle.size,
    grid: puzzle.grid.map((row) =>
      row.map((cell) => ({ ipa: cell.ipa, english: cell.english })),
    ),
    placements: puzzle.words.map((placement) => ({
      english: placement.english,
      cells: placement.cells,
    })),
    words: words.map((word) => ({
      english: word.english,
      phonemes: word.phonemes.map((p) => ({ ipa: p.ipa, english: p.english })),
    })),
  };

  const bodyHtml = `
<h1>Phoneme Word Search</h1>
<p class="subtitle">Find every word with ${escapeHtml(phoneme.label)} (${escapeHtml(phoneme.example)}). Drag across the letters to select a word.</p>
<div class="status" id="status" role="status" aria-live="polite"></div>
<div class="grid" id="grid"></div>
<ul class="clues" id="clues"></ul>`;

  const script = `var DATA = ${serializeData(data)};${GAME_SCRIPT}`;

  return renderDocument({
    title: `Phoneme Word Search — ${phoneme.label}`,
    styles: GAME_STYLES,
    bodyHtml,
    script,
  });
}
