import { useEffect, useState } from "react"
import { FaMinus, FaPlus } from "react-icons/fa6"

import { cn, formatCurrency, surrealDbId } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn/button"
import { Input } from "@/components/ui/shadcn/input"
import { Product } from "@/types/prodcut"
import { useProduct } from "@/queries"

type ProductsListingProps = {
  setAddedProducts: React.Dispatch<React.SetStateAction<Product[]>>
  addedProducts: Product[]
}

export default function ProductsListing({
  setAddedProducts,
  addedProducts
}: ProductsListingProps) {
  const {
    getProducts: { data: products }
  } = useProduct()

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState("all")

  useEffect(() => {
    let result = products

    if (selected === "inStock") {
      result = result?.filter((item) => item.status)
    } else if (selected === "outOfStock") {
      result = result?.filter((item) => !item.status)
    }

    if (search) {
      result = result?.filter((item) =>
        item.product_name.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredProducts(result ?? [])
  }, [products, selected, search])

  const addProduct = (product: Product) => {
    setAddedProducts((prev) => [...prev, product])
  }

  const removeProduct = (productId: string) => {
    setAddedProducts((prevProducts) => {
      const index = prevProducts.findIndex(
        (product) => surrealDbId(product.id) === productId
      )
      if (index > -1) {
        return [...prevProducts.slice(0, index), ...prevProducts.slice(index + 1)]
      }
      return prevProducts
    })
  }

  return (
    <div className="basis-1/3">
      <h2>المنتجات</h2>
      <hr />
      <div className="flex items-center gap-4 mb-10">
        <Input
          placeholder="ابحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant={"secondary"} onClick={() => setSearch("")}>
          مسح
        </Button>
      </div>
      <div className="flex gap-4 mb-4">
        <Button
          className={cn("", selected === "all" && "bg-primary/10")}
          size={"sm"}
          variant={"outline"}
          onClick={() => setSelected("all")}
        >
          الكل
        </Button>
        <Button
          className={cn("", selected === "inStock" && "bg-primary/10")}
          size={"sm"}
          variant={"outline"}
          onClick={() => setSelected("inStock")}
        >
          المتوفر
        </Button>
        <Button
          className={cn("", selected === "outOfStock" && "bg-primary/10")}
          size={"sm"}
          variant={"outline"}
          onClick={() => setSelected("outOfStock")}
        >
          غير المتوفر
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {filteredProducts.map((item) => (
          <div
            key={surrealDbId(item.id)}
            className={cn(
              "flex items-center justify-between p-4 border-[1px] rounded-2xl border-r-8",
              item.status ? "border-r-success/50" : " opacity-60  pointer-events-none"
            )}
          >
            <div className="text-start">
              <h3>{item.product_name}</h3>
              <span className="font-normal">{formatCurrency(item.amount)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => addProduct(item)}
                size={"icon"}
                variant={"default"}
                disabled={!item.status}
                className="w-6 h-6 rounded-sm"
                aria-label="add-item"
              >
                <FaPlus />
              </Button>
              <Button
                onClick={() => removeProduct(surrealDbId(item.id))}
                size={"icon"}
                variant={"secondary"}
                disabled={!item.status || !addedProducts.find((p) => p.id === item.id)}
                className="w-6 h-6 rounded-sm"
                aria-label="remove-item"
              >
                <FaMinus />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <div className="w-full py-20 text-2xl text-center text-muted-foreground">
          لا توجد بضائع
        </div>
      )}
    </div>
  )
}
