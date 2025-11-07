// components/landing/Testimonials.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { motion,  Variants } from "framer-motion";

// 'type' ya data tunayoitarajia kupokea kama 'props'
// Hii inatokana na data tuliyoiandaa kwenye HomePage
export type TestimonialData = {
    name: string;
    location: string;
    quote: string;
    avatarUrl: string;
};

interface TestimonialsProps {
    title: string;
    subtitle: string;
    testimonials: TestimonialData[];
}

export default function Testimonials({ title, subtitle, testimonials }: TestimonialsProps) {
    if (!testimonials || testimonials.length === 0) {
        return null; // Usionyeshe chochote kama hakuna maoni
    }
    
    // Animation variants kwa Framer Motion
   const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.42, 0, 0.58, 1] } 
  },
};
    return (
        <section className="py-24 bg-secondary">
            <div className="container mx-auto">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={fadeUp}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold">{title}</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{subtitle}</p>
                </motion.div>

                <Carousel
                    opts={{ align: "start", loop: true }}
                    className="w-full max-w-5xl mx-auto"
                >
                    <CarouselContent className="-ml-4">
                        {testimonials.map((testimonial, index) => (
                            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <Card className="h-full flex flex-col justify-between p-6">
                                        <div>
                                            {/* Star Rating */}
                                            <div className="flex items-center gap-1 mb-4 text-yellow-500">
                                                <Star fill="currentColor" className="h-5 w-5" />
                                                <Star fill="currentColor" className="h-5 w-5" />
                                                <Star fill="currentColor" className="h-5 w-5" />
                                                <Star fill="currentColor" className="h-5 w-5" />
                                                <Star fill="currentColor" className="h-5 w-5" />
                                            </div>
                                            
                                            {/* Quote/Maoni */}
                                            <CardContent className="p-0">
                                                <p className="italic text-muted-foreground">&quot;{testimonial.quote}&quot;</p>
                                            </CardContent>
                                        </div>
                                        
                                        {/* Maelezo ya Mtoa Maoni */}
                                        <div className="flex items-center gap-4 mt-6 pt-6 border-t">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                                                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{testimonial.name}</p>
                                                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </div>
        </section>
    );
}