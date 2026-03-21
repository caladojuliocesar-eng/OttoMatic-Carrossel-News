import CarouselEngine from "@/components/CarouselEngine";
import AccessGate from "@/components/AccessGate";

export default function Home() {
  return (
    <main>
      <AccessGate>
        <CarouselEngine />
      </AccessGate>
    </main>
  );
}
