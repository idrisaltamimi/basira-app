import { useQuery } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

export default function useStatics() {
  const getLastMonthTotalPayments = useQuery({
    queryKey: ["last_month_total_payment"],
    queryFn: async () => {
      try {
        const res: { amount: number }[] = await invoke("last_month_total", {
          paymentType: "payment"
        })

        const totalAmountToday = res.reduce((total, payment) => total + payment.amount, 0)

        return totalAmountToday
      } catch (error) {
        console.log(error)
      }
    }
  })

  const getLastMonthTotalSpending = useQuery({
    queryKey: ["last_month_total_spending"],
    queryFn: async () => {
      try {
        const res: { amount: number }[] = await invoke("last_month_total", {
          paymentType: "spending"
        })
        console.log(res)
        const totalAmountToday = res.reduce((total, payment) => total + payment.amount, 0)

        return totalAmountToday
      } catch (error) {
        console.log(error)
      }
    }
  })

  const getMaleVisitsCount = useQuery({
    queryKey: ["last_month_male_count"],
    queryFn: async () => {
      try {
        const res: { count: number } = await invoke("last_month_visits_count", {
          gender: "ذكر"
        })

        return res
      } catch (error) {
        console.log(error)
      }
    }
  })

  const getFemaleVisitsCount = useQuery({
    queryKey: ["last_month_female_count"],
    queryFn: async () => {
      try {
        const res: { count: number } = await invoke("last_month_visits_count", {
          gender: "أنثى"
        })

        return res
      } catch (error) {
        console.log(error)
      }
    }
  })

  return {
    getLastMonthTotalPayments,
    getLastMonthTotalSpending,
    getMaleVisitsCount,
    getFemaleVisitsCount
  }
}
