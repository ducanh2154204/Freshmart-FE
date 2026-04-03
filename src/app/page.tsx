import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { GuideCard } from '@/components/GuideCard'
import { GroupBuyingBanner } from '@/components/GroupBuyingBanner'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <GuideCard />
        <GroupBuyingBanner />
      </main>
      <Footer />
    </div>
  )
}
