"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, ExternalLink, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedCard } from "@/components/animated-card"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { CategoryFilter } from "@/components/category-filter"
import { StarRating } from "@/components/star-rating"
import { allLinks } from "@/data/links"

export default function Home() {
  const [sortOrder, setSortOrder] = useState("name")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [visibleLinks, setVisibleLinks] = useState<typeof allLinks>([])
  const [page, setPage] = useState(1)
  const linksPerPage = 12

  // Memoize filtered links to prevent recalculation on every render
  const filteredLinks = useMemo(() => {
    return allLinks
      .filter(
        (link) =>
          (selectedCategories.length === 0 || selectedCategories.includes(link.categoryId)) &&
          (link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      .sort((a, b) => {
        if (sortOrder === "name") {
          return a.name.localeCompare(b.name)
        } else if (sortOrder === "date") {
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        } else if (sortOrder === "category") {
          return a.categoryName.localeCompare(b.categoryName)
        } else if (sortOrder === "rating") {
          return b.rating - a.rating
        }
        return 0
      })
  }, [searchQuery, sortOrder, selectedCategories])

  // Load initial links only once
  useEffect(() => {
    setIsLoaded(true)
    setVisibleLinks(filteredLinks.slice(0, linksPerPage))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intencionalmente vacío para ejecutar solo una vez

  // Update visible links when filters change
  useEffect(() => {
    setPage(1)
    setVisibleLinks(filteredLinks.slice(0, linksPerPage))
  }, [filteredLinks, linksPerPage])

  // Load more links
  const loadMoreLinks = useCallback(() => {
    const nextPage = page + 1
    const startIndex = page * linksPerPage
    const endIndex = nextPage * linksPerPage
    const newLinks = filteredLinks.slice(startIndex, endIndex)

    if (newLinks.length > 0) {
      setVisibleLinks((prev) => [...prev, ...newLinks])
      setPage(nextPage)
    }
  }, [page, filteredLinks, linksPerPage])

  // Memoize the category change handler
  const handleCategoryChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header
          className={`mb-4 text-center relative transition-all duration-700 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
            Colección de Enlaces Favoritos
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Una colección personal de sitios web útiles e interesantes
          </p>
        </header>

        {/* Category filter */}
        <CategoryFilter selectedCategories={selectedCategories} onChange={handleCategoryChange} />

        <div
          className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-700 delay-300 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              type="search"
              placeholder="Buscar enlaces por nombre o descripción..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Ordenar por:{" "}
                  {sortOrder === "name"
                    ? "Nombre"
                    : sortOrder === "date"
                      ? "Fecha"
                      : sortOrder === "category"
                        ? "Categoría"
                        : "Popularidad"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOrder("name")}>Nombre</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("date")}>Fecha añadida</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("category")}>Categoría</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("rating")}>Popularidad</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* All links in a grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleLinks.map((link, index) => (
            <AnimatedCard key={link.id} index={index % linksPerPage}>
              <LinkCardContent link={link} categoryName={link.categoryName} />
            </AnimatedCard>
          ))}
        </div>

        {/* Infinite scroll loader - Only render when needed */}
        {visibleLinks.length > 0 && visibleLinks.length < filteredLinks.length && (
          <InfiniteScroll
            onLoadMore={loadMoreLinks}
            hasMore={visibleLinks.length < filteredLinks.length}
            className="mt-4"
          />
        )}
      </div>
    </main>
  )
}

function LinkCardContent({ link, categoryName }) {
  return (
    <>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{link.name}</CardTitle>
          <StarRating rating={link.rating} />
        </div>
        <CardDescription className="line-clamp-2 h-10">{link.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between pt-2">
        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
          {categoryName}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(link.url, "_blank")}
          className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
        >
          <ExternalLink className="mr-1 h-4 w-4" />
          Visitar
        </Button>
      </CardFooter>
    </>
  )
}
