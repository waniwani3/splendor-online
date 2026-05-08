const { useState, useEffect } = React;

const GEMS = ['white', 'blue', 'green', 'red', 'black'];

const GEM_COLORS = {
  white: 'bg-slate-100 text-slate-800 border-slate-300',
  blue: 'bg-blue-500 text-white border-blue-600',
  green: 'bg-emerald-500 text-white border-emerald-600',
  red: 'bg-red-500 text-white border-red-600',
  black: 'bg-gray-800 text-white border-gray-900',
};

const GEM_ICONS = {
  white: 'fa-gem',
  blue: 'fa-gem',
  green: 'fa-gem',
  red: 'fa-gem',
  black: 'fa-gem',
};

// Dummy Card Generator
const generateDeck = (level, count) => {
  return Array.from({ length: count }).map((_, i) => {
    const provides = GEMS[Math.floor(Math.random() * GEMS.length)];
    const points = level === 1 ? (Math.random() > 0.7 ? 1 : 0) : 
                   level === 2 ? Math.floor(Math.random() * 3) + 1 : 
                   Math.floor(Math.random() * 3) + 3;
    
    const costCount = level === 1 ? 3 : level === 2 ? 5 : 7;
    const cost = {};
    for (let j = 0; j < costCount; j++) {
      const c = GEMS[Math.floor(Math.random() * GEMS.length)];
      cost[c] = (cost[c] || 0) + 1;
    }
    
    return { id: `L${level}-${i}`, level, provides, points, cost };
  });
};

const GemToken = ({ color, count, onClick, className = '' }) => (
  <div 
    className={`gem-token ${GEM_COLORS[color]} ${className}`}
    onClick={onClick}
  >
    <div className="flex flex-col items-center">
      <i className={`fas ${GEM_ICONS[color]} text-sm opacity-50`}></i>
      <span>{count}</span>
    </div>
  </div>
);

const Card = ({ card, onClick }) => {
  if (!card) return <div className="w-32 h-44 rounded-lg bg-slate-800/50 border-2 border-dashed border-slate-700"></div>;
  
  return (
    <div className="card text-slate-800" onClick={onClick}>
      <div className="flex justify-between items-start">
        <span className="font-bold text-xl">{card.points > 0 ? card.points : ''}</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${GEM_COLORS[card.provides]} border`}>
          <i className={`fas ${GEM_ICONS[card.provides]} text-xs`}></i>
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-1">
        {Object.entries(card.cost).map(([color, amount]) => (
          <div key={color} className={`w-full h-6 rounded-sm flex items-center px-1 ${GEM_COLORS[color]} border shadow-sm`}>
             <span className="font-bold text-xs">{amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [supply, setSupply] = useState({ white: 7, blue: 7, green: 7, red: 7, black: 7 });
  const [decks, setDecks] = useState({
    3: generateDeck(3, 20),
    2: generateDeck(2, 30),
    1: generateDeck(1, 40),
  });
  const [visibleCards, setVisibleCards] = useState({ 3: [], 2: [], 1: [] });
  
  const [player, setPlayer] = useState({
    gems: { white: 0, blue: 0, green: 0, red: 0, black: 0 },
    cards: [],
    points: 0
  });
  
  const [selectedGems, setSelectedGems] = useState([]);

  // Initialize visible cards
  useEffect(() => {
    const initVisible = { 3: [], 2: [], 1: [] };
    const newDecks = { ...decks };
    
    [1, 2, 3].forEach(level => {
      for (let i = 0; i < 4; i++) {
        if (newDecks[level].length > 0) {
          initVisible[level].push(newDecks[level].pop());
        }
      }
    });
    
    setVisibleCards(initVisible);
    setDecks(newDecks);
  }, []);

  const handleSupplyClick = (color) => {
    if (supply[color] === 0) return;
    
    const countInSelected = selectedGems.filter(c => c === color).length;
    
    // Logic: can take 3 different, or 2 of same (if >=4 in supply)
    if (selectedGems.length >= 3) return; // Max 3 gems per turn
    
    if (countInSelected === 1) {
       // Want to take 2nd of same color
       if (selectedGems.length > 1) return; // Must be the only color selected
       if (supply[color] < 4) return; // Must have at least 4 in supply to take 2
       setSelectedGems([...selectedGems, color]);
    } else if (countInSelected === 0) {
       // Taking a new color
       if (selectedGems.length === 2 && selectedGems[0] === selectedGems[1]) return; // Already took 2 of same
       setSelectedGems([...selectedGems, color]);
    }
  };

  const clearSelection = () => setSelectedGems([]);

  const takeGems = () => {
    if (selectedGems.length === 0) return;
    
    const newSupply = { ...supply };
    const newPlayerGems = { ...player.gems };
    
    selectedGems.forEach(color => {
      newSupply[color] -= 1;
      newPlayerGems[color] += 1;
    });
    
    setSupply(newSupply);
    setPlayer({ ...player, gems: newPlayerGems });
    setSelectedGems([]);
  };

  // Player discounts based on cards
  const playerDiscounts = player.cards.reduce((acc, card) => {
    acc[card.provides] = (acc[card.provides] || 0) + 1;
    return acc;
  }, { white: 0, blue: 0, green: 0, red: 0, black: 0 });

  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col gap-8">
      <header className="text-center py-4 border-b border-slate-700">
        <h1 className="text-4xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase">Gemstone Artisans</h1>
        <p className="text-slate-400 mt-2">A Splendor-inspired prototype</p>
      </header>

      <main className="flex gap-8">
        {/* Left Side: Cards Area */}
        <div className="flex-1 flex flex-col gap-6 bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
          {[3, 2, 1].map(level => (
            <div key={level} className="flex gap-4">
              <div className="deck">
                Level {level}
                <div className="text-sm font-normal mt-2">{decks[level]?.length || 0} cards left</div>
              </div>
              <div className="flex gap-4">
                {visibleCards[level]?.map((card, i) => (
                  <Card key={card?.id || i} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Tokens and Player Area */}
        <div className="w-80 flex flex-col gap-6">
          {/* Supply */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <h2 className="text-xl font-bold mb-4 text-center text-slate-300">Token Supply</h2>
            <div className="flex justify-center gap-3 flex-wrap">
              {GEMS.map(color => (
                <GemToken 
                  key={color} 
                  color={color} 
                  count={supply[color]} 
                  onClick={() => handleSupplyClick(color)}
                />
              ))}
            </div>
            
            {/* Selected Gems */}
            <div className="mt-6 min-h-[100px] bg-slate-900/50 rounded-lg p-3 border border-slate-800">
               <h3 className="text-sm text-slate-400 mb-2">Selected Tokens</h3>
               <div className="flex gap-2 min-h-[48px]">
                 {selectedGems.map((color, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${GEM_COLORS[color]} flex items-center justify-center border-b-2`}></div>
                 ))}
               </div>
               
               {selectedGems.length > 0 && (
                 <div className="flex gap-2 mt-4">
                   <button onClick={clearSelection} className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-bold transition-colors">Clear</button>
                   <button onClick={takeGems} className="flex-2 px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded text-sm font-bold transition-colors shadow-lg shadow-amber-600/20">Take Tokens</button>
                 </div>
               )}
            </div>
          </div>

          {/* Player Dashboard */}
          <div className="bg-slate-800/80 p-6 rounded-xl border-t-4 border-t-amber-500 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
             
             <div className="flex justify-between items-end mb-6 relative z-10">
               <h2 className="text-2xl font-bold">Your Assets</h2>
               <div className="text-3xl font-black text-amber-400 drop-shadow-md">{player.points} <span className="text-lg text-slate-400 font-normal">VP</span></div>
             </div>
             
             {/* Player Gems */}
             <div className="mb-6 relative z-10">
               <h3 className="text-sm text-slate-400 mb-3 uppercase tracking-wider font-semibold">Tokens</h3>
               <div className="flex justify-between gap-2">
                 {GEMS.map(color => (
                   <div key={color} className="flex flex-col items-center">
                     <div className={`w-10 h-10 rounded-full ${GEM_COLORS[color]} flex items-center justify-center border-b-2 font-bold shadow-md`}>
                       {player.gems[color]}
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Player Cards (Discounts) */}
             <div className="relative z-10">
               <h3 className="text-sm text-slate-400 mb-3 uppercase tracking-wider font-semibold">Gem Bonuses</h3>
               <div className="flex justify-between gap-2">
                 {GEMS.map(color => (
                   <div key={`discount-${color}`} className="flex flex-col items-center">
                     <div className={`w-8 h-10 rounded-sm ${GEM_COLORS[color]} flex items-center justify-center border shadow opacity-90`}>
                       <span className="font-bold">{playerDiscounts[color]}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
