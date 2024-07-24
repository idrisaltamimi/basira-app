import { useState } from "react"

import ProductsListing from "./ProductsListing"
import ProductsSummary from "./ProductsSummary"
import { Product } from "@/types/prodcut"

export default function Products() {
  const [addedProducts, setAddedProducts] = useState<Product[]>([])

  return (
    <div>
      <div className="flex h-full gap-12">
        <ProductsListing
          addedProducts={addedProducts}
          setAddedProducts={setAddedProducts}
        />
        <div className="border-r" />
        <ProductsSummary
          addedProducts={addedProducts}
          setAddedProducts={setAddedProducts}
        />
      </div>
    </div>
  )
}
