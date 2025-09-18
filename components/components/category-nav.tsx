"use client"

import type { Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CategoryNavProps {
  categories: Category[]
  selectedCategory?: string
  onCategorySelect: (categoryId: string | undefined) => void
  language: "en" | "es"
}

export function CategoryNav({ categories, selectedCategory, onCategorySelect, language }: CategoryNavProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 p-1">
        <Button
          variant={!selectedCategory ? "default" : "outline"}
          onClick={() => onCategorySelect(undefined)}
          className={cn(
            "flex-shrink-0",
            !selectedCategory
              ? "bg-amber-400 text-black hover:bg-amber-300"
              : "border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400",
          )}
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => onCategorySelect(category.id)}
            className={cn(
              "flex-shrink-0",
              selectedCategory === category.id
                ? "bg-amber-400 text-black hover:bg-amber-300"
                : "border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400",
            )}
          >
            {language === "es" ? category.name_es : category.name_en}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
