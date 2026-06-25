import React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { useScreenSize } from "@/components/hooks/use-screen-size"

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  // PC gets an extended tube; mobile keeps a shorter one.
  const isMobile = useScreenSize().lessThan("md")
  const tubeInitial = isMobile ? "10rem" : "16rem"
  const tubeWidth = isMobile ? "22rem" : "46rem"
  const glowWidth = isMobile ? "26rem" : "52rem"
  const haloWidth = isMobile ? "30rem" : "60rem"

  return (
    <div
      className={cn(
        // overflow-hidden clips the bloom so no light spills above the bar.
        "relative w-full overflow-hidden bg-maroon-dark z-0",
        className
      )}
    >
      {/* Studio tube light pinned to the very top — glow spills downward only */}
      <div className="relative h-[15vh] md:h-[18vh] w-full">
        {/* Wide soft halo (centred on the bar; upper half is clipped away) */}
        <div
          className="absolute left-1/2 top-0 h-44 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-maroon opacity-40 blur-[90px]"
          style={{ width: haloWidth }}
        />
        {/* Inner glow */}
        <motion.div
          initial={{ opacity: 0.4, width: tubeInitial }}
          whileInView={{ opacity: 0.7, width: glowWidth }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          className="absolute left-1/2 top-0 h-24 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-maroon blur-3xl"
        />
        {/* The tube body, sitting on the top edge */}
        <motion.div
          initial={{ width: tubeInitial }}
          whileInView={{ width: tubeWidth }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          className="absolute left-1/2 top-0 h-2 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-maroon to-transparent"
        />
        {/* Hot white core that makes it read as a lit tube */}
        <motion.div
          initial={{ width: tubeInitial }}
          whileInView={{ width: tubeWidth }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          className="absolute left-1/2 top-0 h-[3px] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-white to-transparent blur-[1px]"
        />
      </div>

      {/* Content sits just beneath the tube's downward glow */}
      <div className="relative z-10 -mt-[5.5rem] md:-mt-[6.5rem] flex w-full flex-col items-center px-5">
        {children}
      </div>
    </div>
  )
}
