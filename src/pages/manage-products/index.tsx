import { useEffect, useState } from "react"

import { cn, formatCurrency, surrealDbId } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn/button"
import { Input } from "@/components/ui/shadcn/input"
import { useProduct } from "@/queries"
import { Product } from "@/types/prodcut"
import EditProduct from "./EditProduct"
import AddProduct from "./AddProduct"
import DeleteProduct from "./DeleteProduct"

export default function ManageProducts() {
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

  return (
    <div>
      <h1>إدارة المنتجات</h1>
      <hr />
      <div className="flex items-center gap-4 mb-10">
        <Input
          placeholder="ابحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-[400px]"
        />
        <Button variant={"secondary"} onClick={() => setSearch("")}>
          مسح
        </Button>

        <AddProduct />
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
      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map((item) => (
          <div
            key={surrealDbId(item.id)}
            className={cn(
              "flex items-center justify-between p-4 border-[1px] rounded-2xl border-r-8",
              item.status ? "border-r-success/50" : " opacity-60 "
            )}
          >
            <div className="text-start">
              <h3>{item.product_name}</h3>
              <span className="font-normal">{formatCurrency(item.amount)}</span>
            </div>

            <div className="flex items-center gap-4">
              <EditProduct product={item} />
              <DeleteProduct productId={item.id} />
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
