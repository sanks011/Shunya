import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { PartnersSection } from "@/components/PartnersSection";
import { AIFeatureSection } from "@/components/AIFeatureSection";
import FeatureCarousel from "@/components/FeatureCarousel";
import FeaturedSectionStats from "@/components/FeaturedSectionStats";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Hero />
      <PartnersSection />
      <AIFeatureSection />
      
      <section className="py-20 px-6">
        <div className="w-full max-w-5xl mx-auto">
          <div className="rounded-[34px] bg-primary/10 p-2 border border-primary/20">
            <div className="relative z-10 grid w-full gap-8 rounded-[28px] bg-background p-2">
              <FeatureCarousel
                title="Interactive Feature Demo"
                description="Showcase your features with smooth animations and transitions"
                image={{
                  step1light1: "https://i.postimg.cc/SKcdVTr1/Dashboard2.png",
                  step1light2: "https://i.postimg.cc/SKcdVTr1/Dashboard2.png",
                  step2light1: "https://i.postimg.cc/SKcdVTr1/Dashboard2.png",
                  step2light2: "https://i.postimg.cc/SKcdVTr1/Dashboard2.png",
                  step3light: "https://i.postimg.cc/SKcdVTr1/Dashboard2.png",
                  step4light: "https://i.postimg.cc/SKcdVTr1/Dashboard2.png",
                  alt: "Feature demonstration",
                }}
                bgClass="bg-card"
              />
            </div>
          </div>
        </div>
      </section>

      <FeaturedSectionStats />
    </main>
  );
};

export default Index;
