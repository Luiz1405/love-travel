import { Navbar } from "../../shared/ui/layout/Navbar"
import { Benefits } from "./components/Benefits"
import { FeaturedCarousel } from "./components/FeaturedCarousel"
import { Hero } from "./components/Hero"

export function HomePage() {
    return (
        <div className="min-h-dvh bg-blue-50">
            <Navbar />
            <main>
                <Hero />
                <FeaturedCarousel />
                <Benefits />
            </main>
        </div>
    )
}