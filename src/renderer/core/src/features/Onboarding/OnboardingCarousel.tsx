import { useState, useCallback, useEffect } from 'react'
import { Clapperboard, Send, Code, Folder, Rocket } from 'lucide-react'
import type { CarouselApi } from '@components/ui/carousel'
import menubarImage from '../../assets/onboard/statusmenu.png'
import foldersImage from '../../assets/onboard/folders.png'
import metadataImage from '../../assets/onboard/metadata.webp'
import editorImage from '../../assets/onboard/editor.png'
import presetsImage from '../../assets/onboard/presets.png'
import daytalogo from '../../assets/DAYTALOGO.svg'

import { Carousel, CarouselContent, CarouselItem } from '@components/ui/carousel'
import { Button } from '@components/ui/button'

// Define the features to display in the carousel
const features = [
  {},
  {
    title: 'Lives in your status bar',
    description: 'The app runs in the background and can be easely accessed thru the status bar.',
    image: menubarImage,
    icon: <Rocket className="h-5 w-5 text-foreground" />
  },
  {
    title: 'Project Folder',
    description: 'All files and configs are located in documents/daytalog',
    image: foldersImage,
    icon: <Folder className="h-5 w-5 text-foreground" />
  },
  {
    title: 'Add and edit metadata',
    description: 'Easy editing of metadata, override clips by setting headers.',
    image: metadataImage,
    icon: <Clapperboard className="h-5 w-5 text-foreground" />
  },
  {
    title: '100% Custom Templates',
    description: 'Design your own templates using React and inline CSS.',
    image: editorImage,
    icon: <Code className="h-5 w-5 text-foreground" />
  },
  {
    title: 'Distribute in 3-clicks',
    description: 'Export reports or distribute emails in seconds with presets!',
    image: presetsImage,
    icon: <Send className="h-5 w-5 text-foreground" />
  },
  {
    title: 'Need more guidance?',
    description: (
      <>
        Check out the online{' '}
        <a
          onClick={() => window.externalApi.openExternal('https://docs.daytalog.com')}
          className="underline decoration-2 decoration-blue-400 underline-offset-4 hover:text-primary hover:cursor-pointer"
        >
          documentation
        </a>
      </>
    ),
    icon: <Rocket className="h-5 w-5 text-foreground" />
  }
]

export function OnboardingCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)
  const isLastSlide = currentSlide === features.length - 1

  const handleNext = useCallback(() => {
    if (!api) return
    api.scrollNext()
  }, [api])

  useEffect(() => {
    if (!api) return
    const handleSelect = () => {
      setCurrentSlide(api.selectedScrollSnap())
    }
    api.on('select', handleSelect)
    return () => {
      api.off('select', handleSelect)
    }
  }, [api])

  return (
    <div className="relative mx-auto w-full max-w-[700px]">
      <Carousel
        opts={{
          loop: false,
          axis: 'y'
        }}
        className="w-full"
        setApi={setApi}
      >
        <CarouselContent>
          {features.map((feature, index) => (
            <CarouselItem key={index} data-carousel-item>
              {index === 0 ? (
                <div className="flex flex-col h-full mb-6 items-center">
                  <img src={daytalogo} className="size-32" />
                  <div className="flex flex-col justify-center h-full items-center">
                    <h1 className="hero-fade-in mb-4 text-4xl font-semibold tracking-normal text-center text-foreground">
                      Get started
                    </h1>
                    <p className="hero-fade-in-delay-200 mt-2 text-base text-muted-foreground text-center px-6">
                      Let's walk you through the key features to get you started
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-1">
                  <div className="overflow-hidden rounded-lg border">
                    <img
                      src={feature.image}
                      className="max-h-60 aspect-[16/10] w-full object-cover mx-auto"
                    />
                  </div>
                  <div className="mt-4 flex flex-col items-center text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-400">
                      {feature.icon}
                    </div>
                    <h1 className="hero-fade-in mt-4 max-w-md text-3xl font-bold tracking-normal capitalize text-center px-4">
                      {feature.title}
                    </h1>
                    <span className="hero-fade-in-delay-200 mt-2 text-base text-muted-foreground text-center px-6">
                      {feature.description}
                    </span>
                  </div>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="animate-fade-in mt-10 flex flex-col items-center">
        <Button
          onClick={isLastSlide ? () => window.onboardingApi.finishOnboarding() : handleNext}
          className="mb-4"
          size="lg"
        >
          {isLastSlide ? 'Create Your First Project' : 'Continue'}
        </Button>

        <div className="flex justify-center gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${currentSlide === index ? 'bg-primary' : 'bg-muted'}`}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
        <Button
          onClick={() => window.onboardingApi.finishOnboarding()}
          className="mt-4"
          size="sm"
          variant="ghost"
        >
          skip
        </Button>
      </div>
    </div>
  )
}
