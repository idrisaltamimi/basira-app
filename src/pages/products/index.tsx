import { useState } from "react"

import ProductsListing from "./ProductsListing"
import ProductsSummary from "./ProductsSummary"
import { Product } from "@/types/product"

export default function Products() {
  const [addedProducts, setAddedProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  return (
    <div>
      <div className="flex h-full gap-12">
        <ProductsListing
          setAddedProducts={setAddedProducts}
          filteredProducts={filteredProducts}
          setFilteredProducts={setFilteredProducts}
        />
        <div className="border-r" />
        <ProductsSummary
          addedProducts={addedProducts}
          setAddedProducts={setAddedProducts}
          setFilteredProducts={setFilteredProducts}
        />
      </div>
    </div>
  )
}
