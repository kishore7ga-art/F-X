'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <main className="overflow-hidden bg-black text-white">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.04)_0,hsla(0,0%,55%,.01)_50%,transparent_80%)]" />
                </div>
                <section className="bg-black text-white">
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring' as const,
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <img
                                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                                alt="background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block max-h-[600px] object-top object-cover opacity-70"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full bg-black" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link href="/start" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/80 px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-md shadow-md hover:border-white/20 transition group mb-4">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black border border-white/20 p-0.5 shrink-0 group-hover:scale-105 transition-transform">
                                            <img src="/xite-logo.png" alt="XITE Logo" className="h-full w-full object-contain" />
                                        </div>
                                        <span>Build Modern College Websites</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>

                                    <h1
                                        className="mt-4 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-8 xl:text-[5.25rem] font-bold tracking-tight">
                                        Build Modern College Websites <br className="hidden sm:inline" />
                                        <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                                            Without Writing Code
                                        </span>
                                    </h1>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg text-neutral-300">
                                        Create, customize, and publish professional websites with our intuitive drag-and-drop builder. Launch your institution's website faster than ever.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div key={1}>
                                        <Link href="/editor/greenfield" className="p-[3px] relative inline-block group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl" />
                                            <div className="px-8 py-3 bg-black rounded-[10px] relative group transition duration-200 text-white font-bold text-base hover:bg-transparent flex items-center justify-center gap-2">
                                                <span>Start Editing Now</span>
                                                <span className="text-blue-400">→</span>
                                            </div>
                                        </Link>
                                    </div>
                                    <div key={2}>
                                        <Link href="/start" className="p-[3px] relative inline-block group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-neutral-700 to-neutral-800 rounded-xl" />
                                            <div className="px-8 py-3 bg-black rounded-[10px] relative group transition duration-200 text-neutral-300 font-semibold text-base hover:bg-transparent flex items-center justify-center">
                                                View Templates
                                            </div>
                                        </Link>
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-2 shadow-2xl shadow-blue-900/20 ring-1 border-neutral-800">
                                    <img
                                        className="w-full relative rounded-xl shadow-2xl border border-neutral-800 object-cover"
                                        src="/xite-editor-hero.jpg"
                                        alt="XITE Visual Website Builder Dashboard"
                                        width="2700"
                                        height="1440"
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </main>
        </>
    )
}
