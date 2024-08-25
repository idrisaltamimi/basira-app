import { toast } from "@/components/ui/use-toast"
import { NewPayment, Payment, PaymentItem, UpdatePaymentData } from "@/types/payment"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

type CreatePaymentItemData = {
  name: string
  amount: number
}

type CreatePaymentItem = {
  items: CreatePaymentItemData[]
  visitId: string
  paymentId: string
}

export default function usePayment() {
  const queryClient = useQueryClient()

  const getUnpaidPayments = useQuery({
    queryKey: ["get_unpaid_payments"],
    queryFn: async () => {
      try {
        const res: Payment[] = await invoke("get_payments", { pending: true })
        return res
      } catch (error) {
        console.log(error)
      }
    }
  })

  const getPaymentItems = useQuery({
    queryKey: ["get_payment_items"],
    queryFn: async () => {
      try {
        // const res: PaymentItem[] = await invoke("get_payment_items", { pending: true })
        return []
      } catch (error) {
        console.log(error)
      }
    }
  })

  const getPaymentsCount = useMutation({
    mutationKey: ["get_payments_count"],
    mutationFn: async (paymentId: string) => {
      try {
        const res = await invoke("get_payments_count", { paymentId })

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
        queryKey: ["get_unpaid_payments", "get_paid_payments"]
      })
    },
    onError: () => {
      toast({
        title: "حدث خطأ عند حفظ المحاسبة",
        variant: "destructive"
      })
    }
  })

  const createItemsPayment = useMutation({
    mutationFn: async ({ items, visitId, paymentId }: CreatePaymentItem) => {
      try {
        const res = await invoke("create_payment_item", {
          items,
          paymentId,
          visitId
        })
        return res
      } catch (error) {
        console.log(error)
        throw new Error(error as string)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_unpaid_payments", "get_paid_payments"]
      })
    },
    onError: (error) => {
      console.error(error)
      toast({
        title: "حدث خطأ عند حفظ المحاسبة",
        variant: "destructive"
      })
    }
  })

  const createProductPayments = useMutation({
    mutationFn: async (data: NewPayment) => {
      try {
        const res = await invoke("create_products_payments", {
          data
        })
        return res
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_unpaid_payments"] })
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
        queryKey: ["get_unpaid_payments"]
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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_unpaid_payments"]
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
    createItemsPayment,
    getPaymentItems
  }
}
