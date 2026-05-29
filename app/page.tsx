import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { TheChallenge } from '@/components/sections/TheChallenge'
import { OurSolution } from '@/components/sections/OurSolution'
import { Results } from '@/components/sections/Results'
import { DashboardPreview } from '@/components/sections/DashboardPreview'
import { TechStack } from '@/components/sections/TechStack'
import { Testimonial } from '@/components/sections/Testimonial'
import { CallToAction } from '@/components/sections/CallToAction'
import { ScrollProgress } from '@/components/motion/ScrollProgress'

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <TheChallenge />
        <OurSolution />
        <Results />
        <DashboardPreview />
        <TechStack />
        <Testimonial />
        <CallToAction />
      </main>
      <Footer />
    </>
  )
}
