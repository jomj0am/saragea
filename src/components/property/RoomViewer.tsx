'use client'

import { type Property, type Room } from '@prisma/client'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Button } from '../ui/button'
import RoomCard from '../shared/RoomCard'
import { KeyRound, Plus } from 'lucide-react'
import Image from 'next/image'
import clsx from 'clsx'
import { useState } from 'react'

type PropertyWithRooms = Property & { rooms: Room[] }

export default function RoomViewer({ property }: { property: PropertyWithRooms }) {
  const vacantRooms = property.rooms.filter(r => !r.isOccupied)
  const [active, setActive] = useState(0)

  // config for thumbs
  const MAX_LG = 6
  const MAX_SM = 4
  const limit = typeof window !== 'undefined' && window.innerWidth < 768 ? MAX_SM : MAX_LG

  const visibleThumbs = vacantRooms.slice(0, limit)
  const needsMoreIndicator = vacantRooms.length > limit
  const placeholders = limit - visibleThumbs.length > 0 ? limit - visibleThumbs.length : 0

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full py-5 rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary dark:from-sky-900 dark:via-slate-800 to-purple-500 text-white hover:scale-105 transition-transform shadow-lg">
          <KeyRound className="h-5 w-5" /> View {vacantRooms.length} Available Rooms
        </Button>
      </DrawerTrigger>

      <DrawerContent className=" h-[100vh] mx-auto !rounded-t-3xl overflow-hidden bg-white dark:bg-slate-950  border-slate-300/5 backdrop-blur-2xl shadow-2xl p-4">
        <div className="absolute top-0 left-0 w-30 !rounded-l-3xl h-20 rounded-full dark:bg-white/20   blur-xl"/>
        <div className="absolute left-1/2 top-6 -translate-x-1/2 -translate-y-1/2 z-10 w-24 rounded-2xl animate-pulse h-2 bg-slate-400/30" />

        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-white/30 to-purple-300/20 dark:via-black/60 backdrop-blur-xl animate-pulse-slow rounded-3xl pointer-events-none" />

        <div className="container z-20 mx-auto flex flex-col gap-6 pb-28"> 
          <DrawerHeader>
            <DrawerTitle className="text-2xl md:text-4xl font-extrabold text-center text-primary drop-shadow-md">
              Available Rooms at {property.name}
            </DrawerTitle>
          </DrawerHeader>

          {vacantRooms.length > 0 ? (
            <div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-y-auto pb-20"
            >
              {vacantRooms.map((room, idx) => (
                <div key={room.id} onClick={() => setActive(idx)} className=''>
                  <RoomCard room={room} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-8 text-lg">
              No rooms are currently available in this property.
            </p>
          )}
        </div>

        {/* Sticky thumbnail row */}
        {vacantRooms.length > 0 && (
          <div className="fixed bottom-0 z-50 left-0 w-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-t border-gray-200/80 dark:border-slate-500/40 shadow-inner">
            <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 p-3 px-4 overflow-x-auto scrollbar-hide">
              {visibleThumbs.map((room, idx) => (
                <button
                  key={room.id}
                  onClick={() => setActive(idx)}
                  className={clsx(
                    'relative flex-shrink-0 rounded-xl border-2 overflow-hidden transition-all duration-300',
                    idx === active
                      ? 'border-primary/50 scale-105 shadow-lg'
                      : 'border-transparent opacity-80 hover:opacity-100',
                    'h-20 w-24 sm:w-28'
                  )}
                >
                  {room.images?.[0] ? (
                    <Image
                      src={room.images[0]}
                      alt={room.roomNumber || `Room ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300/30 dark:bg-gray-500/30 animate-pulse" />
                  )}
                </button>
              ))}

              {/* Skeleton placeholders if less than limit */}
              {Array.from({ length: placeholders }).map((_, i) => (
                <div
                  key={`ph-${i}`}
                  className="h-20 w-24 sm:w-28 rounded-xl bg-gray-200/30 dark:bg-gray-500/30 animate-pulse border border-dashed border-gray-300 dark:border-gray-300/40"
                />
              ))}

              {/* +more indicator if needed */}
              {needsMoreIndicator && (
                <div className="h-20 w-24 sm:w-28 flex items-center justify-center rounded-xl border-2 border-primary/40 bg-primary/10 text-primary font-semibold">
                  <Plus className="mr-1 h-5 w-5" /> more
                </div>
              )}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
