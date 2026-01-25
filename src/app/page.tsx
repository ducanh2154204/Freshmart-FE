import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { CategoriesSection } from '@/components/CategoriesSection'
import { ProductsSection } from '@/components/ProductsSection'
import { GroupBuyingBanner } from '@/components/GroupBuyingBanner'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <ProductsSection />
        <GroupBuyingBanner />
      </main>
      <Footer />
    </div>
  )
}
