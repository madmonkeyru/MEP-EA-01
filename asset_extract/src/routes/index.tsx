import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CostaRicaPlate, type PlateFraming } from "@/components/costa-rica-plate";
import { provinces } from "@/components/map-geometry";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [framing, setFraming] = useState<PlateFraming>("sheet");

  return (
    <main className="stage">
      <h1 className="sr-only">Costa Rica, administrative map, 1950</h1>
      <CostaRicaPlate framing={framing} />
      <div className="view-switch" role="group" aria-label="How the plate fills the page">
        <button type="button" aria-pressed={framing === "sheet"} onClick={() => setFraming("sheet")}>
          Sheet
        </button>
        <button type="button" aria-pressed={framing === "bleed"} onClick={() => setFraming("bleed")}>
          Bleed
        </button>
      </div>
      <section className="plate-key">
        <h2>Costa Rica</h2>
        <p>Administrative map, 1950. Seven provinces, redrawn as vectors from the Map Division sheet.</p>
        <ol>
          {provinces.map((province) => (
            <li key={province.id}>{`${province.numeral}. ${province.name}`}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
