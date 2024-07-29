import { NewPayment, Payment, UpdatePaymentData } from "@/types/payment"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

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

  const getPaymentsCount = useQuery({
    queryKey: ["get_payments_count"],
    queryFn: async () => {
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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_unpaid_payments", "get_paid_payments"]
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
        console.error(error)
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
    getPaymentsCount
  }
}
