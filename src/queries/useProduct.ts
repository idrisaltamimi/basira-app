import { toast } from "@/components/ui/use-toast"
import { Product } from "@/types/product"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

type CreateProduct = {
  product_name: string
  amount: number
  quantity: number
}

interface UpdateProduct extends CreateProduct {
  id: string
}

export default function useProduct() {
  const queryClient = useQueryClient()

  const getProducts = useQuery({
    queryKey: ["get_product"],
    queryFn: async () => {
      try {
        const res: Product[] = await invoke("get_product")
        return res
      } catch (error) {
        console.error(error)
      }
    },
    refetchOnMount: true
  })

  const createProduct = useMutation({
    mutationFn: async (data: CreateProduct) => {
      try {
        await invoke("create_product", {
          data
        })
      } catch (error) {
        console.error(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_product"] })
    },
    onError: () => {
      toast({
        title: "حدث خطأ أثناء إضافة الحساب",
        variant: "destructive"
      })
    }
  })

  const updateProduct = useMutation({
    mutationFn: async (data: UpdateProduct) => {
      try {
        await invoke("update_product", {
          data
        })
      } catch (error) {
        console.error(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_product"] })
    }
  })

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      try {
        await invoke("delete_product", {
          productId
        })
      } catch (error) {
        console.error(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_product"] })
    }
  })

  return { createProduct, getProducts, updateProduct, deleteProduct }
}
