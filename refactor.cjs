const fs = require('fs');
let lines = fs.readFileSync('src/components/PardonCalculatorView.tsx', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('{/* CARD 2: CONVICTIONS TABLE */}'));
const endIdx = lines.findIndex(l => l.includes('{/* ── RIGHT COLUMN ── */}')) - 1;

if (startIdx !== -1 && endIdx !== -1) {
    const card2Lines = lines.splice(startIdx, endIdx - startIdx);
    
    // find the end of the TWO-COLUMN grid
    let insertIdx = lines.length - 4; // usually before the last two closing divs
    
    lines.splice(insertIdx, 0, '', '      {/* ── FULL WIDTH TABLE ── */}', '      <div className="w-full mt-6">', ...card2Lines, '      </div>');
    
    fs.writeFileSync('src/components/PardonCalculatorView.tsx', lines.join('\n'));
    console.log('Success');
} else {
    console.log('Could not find boundaries');
}
