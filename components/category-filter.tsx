"use client"

import { useState, useEffect, useRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { categories } from "@/data/links"

interface CategoryFilterProps {
  selectedCategories: string[]
  onChange: (categories: string[]) => void
}

export function CategoryFilter({ selectedCategories, onChange }: CategoryFilterProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Función para manejar el cambio de estado de los checkboxes
  const handleCategoryChange = (categoryId: string, isChecked: boolean) => {
    if (isProcessingRef.current) return

    isProcessingRef.current = true

    // Use setTimeout to break the potential update cycle
    setTimeout(() => {
      if (isChecked) {
        onChange([...selectedCategories, categoryId])
      } else {
        onChange(selectedCategories.filter((id) => id !== categoryId))
      }

      isProcessingRef.current = false
    }, 0)
  }

  return (
    <div
      className={`flex flex-wrap justify-center gap-2 mb-6 transition-all duration-700 delay-200 ease-out ${
        isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {categories.map((category) => (
        <div key={category.id} className="flex items-center space-x-2">
          <Checkbox
            id={`category-${category.id}`}
            checked={selectedCategories.includes(category.id)}
            onCheckedChange={(checked) => {
              // Solo actualizamos cuando el valor es booleano
              if (typeof checked === "boolean") {
                handleCategoryChange(category.id, checked)
              }
            }}
          />
          <Label
            htmlFor={`category-${category.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {category.name}
          </Label>
        </div>
      ))}
    </div>
  )
}
