'use client';

import { useState, useEffect } from 'react';

interface GridLoaderProps {
  isVisible: boolean;
}

// Fisher-Yates shuffle
function shuffleArray(): number[] {
  const items = Array.from({ length: 100 }, (_, i) => i);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function GridLoader({ isVisible }: GridLoaderProps) {
  const [gridItems, setGridItems] = useState<number[]>(() => shuffleArray());

  // Re-shuffle when loader becomes visible
  useEffect(() => {
    if (isVisible) {
      setGridItems(shuffleArray());
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <style jsx>{`
        .load_grid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          grid-template-rows: repeat(10, 1fr);
          gap: 0;
          width: 100vw;
          height: 100vh;
        }

        .load_grid-item {
          width: 100%;
          height: 100%;
          background-color: white;
          aspect-ratio: 1;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .load_grid {
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(13, 1fr);
          }
        }

        @media (max-width: 480px) {
          .load_grid {
            grid-template-columns: repeat(6, 1fr);
            grid-template-rows: repeat(17, 1fr);
          }
        }
      `}</style>
      <div
        className="fixed inset-0 z-50 bg-black"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.1s ease-in-out',
        }}
      >
        <div className="load_grid">
          {gridItems.map((item, index) => (
            <div
              key={`grid-item-${index}`}
              id={`w-node-${item.toString().padStart(4, '0')}-53ab5cbc`}
              className="load_grid-item"
              style={{
                opacity: 0,
                animation: `fadeIn 0.1s ease-in-out ${Math.random() * 0.8}s forwards`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
