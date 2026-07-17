"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

// Adapted for Genesis Kreations: the circular stack is themed to the brand
// (maroon FAB, maroon-dark items, cream icons) instead of the original grays,
// since the site is dark-themed and doesn't toggle a `.dark` class. The
// expand/clip-path animation is kept exactly as the source component.

interface MenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
  showChevron?: boolean
}

export function Menu({ trigger, children, align = "left", showChevron = true }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-flex items-center"
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        {showChevron && (
          <ChevronDown className="ml-2 -mr-1 h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-9 focus:outline-none z-50`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  isActive?: boolean
  // Optional text shown beside the circle by MenuContainer (rendered outside the
  // circle's clip-path, so it's destructured out here and not put on the button).
  label?: string
  "aria-label"?: string
}

export function MenuItem({
  children,
  onClick,
  disabled = false,
  icon,
  isActive = false,
  label: _label,
  ...props
}: MenuItemProps) {
  return (
    <button
      className={`relative block w-full h-[52px] rounded-full text-center group
        ${disabled ? "text-cream/40 cursor-not-allowed" : "text-cream"}
        ${isActive ? "bg-cream/15" : ""}
      `}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <span className="flex items-center justify-center h-full mt-[5%]">
        {icon && (
          <span className="h-6 w-6 transition-all duration-200 group-hover:[&_svg]:stroke-[2.5]">
            {icon}
          </span>
        )}
        {children}
      </span>
    </button>
  )
}

export function MenuContainer({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const childrenArray = React.Children.toArray(children)
  const menuId = React.useId()

  const handleToggle = () => setIsExpanded((v) => !v)

  // The first child is the toggle, not a menu item: override its role so it's a
  // native button trigger (aria-haspopup/expanded) instead of an orphan
  // role="menuitem". The remaining children are wrapped in a role="menu" below
  // so their menuitem roles have the required menu parent.
  const toggleChild = childrenArray[0]
  const toggle = React.isValidElement(toggleChild)
    ? React.cloneElement(toggleChild as React.ReactElement<Record<string, unknown>>, {
        role: undefined,
        "aria-haspopup": "menu",
        "aria-expanded": isExpanded,
        "aria-controls": menuId,
      })
    : toggleChild

  return (
    <div className="relative w-[52px]" data-expanded={isExpanded}>
      {/* Container for all items */}
      <div className="relative">
        {/* First item — always visible; toggles the stack open/closed. */}
        <div
          className="relative w-[52px] h-[52px] bg-maroon cursor-pointer rounded-full group will-change-transform z-50 shadow-lg ring-1 ring-tan/30"
          onClick={handleToggle}
        >
          {toggle}
        </div>

        {/* Other items. The animated wrapper carries the translate/opacity; the
            circle inside keeps the clip-path, and the label sits outside it so
            it isn't clipped. The role="menu" wrapper gives the menuitem children
            their required parent without affecting layout (it isn't positioned,
            so the absolute items still resolve against the outer .relative). */}
        <div role="menu" id={menuId} aria-orientation="vertical" aria-label="Site navigation">
        {childrenArray.slice(1).map((child, index) => {
          const label = React.isValidElement<MenuItemProps>(child)
            ? child.props.label
            : undefined
          return (
            <div
              key={index}
              className="absolute top-0 left-0 w-[52px] h-[52px] will-change-transform"
              style={{
                transform: `translateY(${isExpanded ? (index + 1) * 60 : 0}px)`,
                opacity: isExpanded ? 1 : 0,
                pointerEvents: isExpanded ? "auto" : "none",
                zIndex: 40 - index,
                transition: `transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
                           opacity ${isExpanded ? "300ms" : "350ms"}`,
              }}
            >
              {/* Label — slides in to the left of the circle. */}
              {label && (
                <span
                  className="pointer-events-none absolute right-[60px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-maroon-dark/90 px-3 py-1 text-sm font-medium text-cream shadow-lg ring-1 ring-cream/10 backdrop-blur-sm"
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transform: `translate(${isExpanded ? 0 : 8}px, -50%)`,
                    transition: "opacity 300ms ease, transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    transitionDelay: isExpanded ? `${index * 40}ms` : "0ms",
                  }}
                >
                  {label}
                </span>
              )}

              {/* The clipped circle holding the icon button. */}
              <div
                className="w-[52px] h-[52px] bg-maroon-dark rounded-full shadow-lg ring-1 ring-cream/10"
                style={{
                  clipPath:
                    index === childrenArray.length - 2
                      ? "circle(50% at 50% 50%)"
                      : "circle(50% at 50% 55%)",
                  backfaceVisibility: "hidden",
                  perspective: 1000,
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                {child}
              </div>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}
