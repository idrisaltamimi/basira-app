import { toast } from "@/components/ui/use-toast"
import { NewPayment, Payment, UpdatePaymentData } from "@/types/payment"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

type CreatePaymentItemData = {
  name: string
  amount: number
}

export default function usePayment() {
  const queryClient = useQueryClient()

  const getUnpaidPayments = useQuery({
    queryKey: ["get_payments"],
    queryFn: async () => {
      try {
        const res: Payment[] = await invoke("get_payments")
        return res
      } catch (error) {
        console.log(error)
      }
    }
  })

  const getPaymentsCount = useMutation({
    mutationKey: ["get_payments_count"],
    mutationFn: async () => {
      try {
        const res: { count: number } = await invoke("get_payments_count")

        return res
      } catch (error) {
        console.error(error)
      }
    }
  })

  const createNewPayment = useMutation({
    mutationFn: async (data: NewPayment) => {
      try {
        const res = await invoke("create_payment", {
          data: {
            ...data,
            name: data.name?.toLocaleLowerCase()
          }
        })
        return res
      } catch (error) {
        console.log(error)
        throw new Error(error as string)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_payments", "get_rebound_payments_products"]
      })
    },
    onError: () => {
      toast({
        title: "حدث خطأ عند حفظ المحاسبة",
        variant: "destructive"
      })
    }
  })

  const createProductPayments = useMutation({
    mutationFn: async ({
      paymentData,
      paymentItems,
      updatedProducts
    }: {
      paymentData: NewPayment
      paymentItems: { items: CreatePaymentItemData[]; visit_id: string }
      updatedProducts: { product_id: string; count: number }[]
    }) => {
      try {
        const res = await invoke("create_products_payments", {
          paymentData,
          paymentItems,
          updatedProducts
        })
        return res
      } catch (error) {
        console.log(error)
        throw Error(error as string)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_product"]
      })
      toast({
        title: "تمت العملية بنجاح"
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "حدث خطأ عند إجراء المحاسبة!"
      })
    }
  })

  const updatePayment = useMutation({
    mutationFn: async (data: UpdatePaymentData) => {
      try {
        const res = await invoke("update_payment", { data })
        return res
      } catch (error) {
        toast({
          title: "حدث خطأ ما!",
          variant: "destructive"
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_payments"]
      })
    }
  })

  const deletePayment = useMutation({
    mutationFn: async (paymentId: string) => {
      try {
        const res = await invoke("delete_payment", { paymentId })
        return res
      } catch (error) {
        console.error(error)
        throw new Error(error as string)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_filtered_payments_query"]
      })
      toast({
        title: "تم حذف المحاسبة"
      })
    },
    onError: () => {
      toast({
        title: "حدث خطأ عند حذف المحاسبة",
        variant: "destructive"
      })
    }
  })

  const deletePaymentItem = useMutation({
    mutationFn: async ({
      paymentId,
      visitId,
      paymentItemId,
      paymentItemName
    }: {
      paymentId: string
      visitId: string
      paymentItemId: string
      paymentItemName: string
    }) => {
      try {
        const res = await invoke("delete_payment_item", {
          paymentId,
          visitId,
          paymentItemId,
          paymentItemName
        })
        return res
      } catch (error) {
        console.error(error)
        throw new Error(error as string)
      }
    },
    onError: () => {
      toast({
        title: "حدث خطأ عند حذف المحاسبة",
        variant: "destructive"
      })
    }
  })

  return {
    createNewPayment,
    getUnpaidPayments,
    updatePayment,
    deletePayment,
    createProductPayments,
    getPaymentsCount,
    deletePaymentItem
  }
}
