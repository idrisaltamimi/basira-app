import type { IconType } from "react-icons/lib"
import { BsGraphDown, BsGraphUp } from "react-icons/bs"
import { FaFemale, FaMale } from "react-icons/fa"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Rectangle
} from "recharts"

import { cn, formatCurrency } from "@/lib/utils"
import { useStatics } from "@/hooks"
import { useQuery } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

// type SummedByPaymentType = {
//   [key in Payment["payment_type"]]?: number
// }

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function Statics() {
  const {
    getLastMonthTotalPayments: { data: totalPayments },
    getLastMonthTotalSpending: { data: totalSpending },
    getMaleVisitsCount: { data: maleCount },
    getFemaleVisitsCount: { data: femaleCount }
  } = useStatics()

  const visitsCount = (count: number) => {
    if (count == 1) return "زيارة واحدة"
    else if (count == 2) return "زيارتين"
    else if (count && count <= 10) return `${count} زيارات`
    else if (count && count > 10) return `${count} زيارة`
    else return "0 زيارات"
  }

  const visitorsCountPerYear = useQuery({
    queryKey: ["get_yearly_visits"],
    queryFn: async () => {
      try {
        const res: { male: number; female: number; month: number }[] = await invoke(
          "get_yearly_visits"
        )

        return res
      } catch (error) {
        console.error(error)
      }
    }
  })

  const paymentsPerYear = useQuery({
    queryKey: ["get_yearly_payments_summary"],
    queryFn: async () => {
      try {
        const res: {
          products: number
          salaries: number
          visits: number
          expenses: number
          month: number
        }[] = await invoke("get_yearly_payments_summary")

        return res
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <div className="flex flex-col items-start gap-5 mt-6">
      <div>
        <div className="flex gap-5">
          <HeaderCard
            header="إجمالي الزيارات لهذا الشهر"
            content={visitsCount(maleCount?.count ?? 0)}
            Icon={FaMale}
            iconColor="bg-[#4A90E2]"
          />
          <HeaderCard
            header="إجمالي الزيارات لهذا الشهر"
            content={visitsCount(femaleCount?.count ?? 0)}
            Icon={FaFemale}
            iconColor="bg-[#ff73a9]"
          />
          <HeaderCard
            header="إجمالي الحسابات لهذا الشهر"
            content={formatCurrency(totalPayments ?? 0)}
            Icon={BsGraphUp}
            iconColor="bg-success"
          />
          <HeaderCard
            header="إجمالي المصروفات لهذا الشهر"
            content={formatCurrency(totalSpending ?? 0)}
            Icon={BsGraphDown}
            iconColor="bg-destructive"
          />
        </div>
      </div>
      <div className="flex gap-6 w-full h-[700px] mt-8">
        <div className="w-[48%] h-[700px]">
          <h2 className="text-center text-muted-foreground">الزيارات لهذه السنة</h2>
          <hr />
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={visitorsCountPerYear.data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={"الشهر"}
                name="الشهر"
                padding={{ right: 16 }}
              />
              <YAxis label={"الزوار"} padding={{ top: 16 }} tickMargin={16} />
              <Tooltip />
              <Legend align="right" />

              <Bar
                dataKey="female"
                name="إناث"
                fill="#8884d8"
                activeBar={<Rectangle fill="pink" stroke="blue" />}
                stackId="a"
              />
              <Bar
                dataKey="male"
                name="ذكور"
                fill="#82ca9d"
                activeBar={<Rectangle fill="gold" stroke="purple" />}
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-[48%] h-[700px]">
          <h2 className="text-center text-muted-foreground">المحاسبات لهذه السنة</h2>
          <hr />
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={paymentsPerYear.data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={"الشهر"}
                name="الشهر"
                padding={{ right: 16 }}
              />
              <YAxis label={"المبلغ"} padding={{ top: 16 }} tickMargin={32} />
              <Tooltip />
              <Legend align="right" />

              <Bar
                dataKey="products"
                name="المنتجات"
                fill="#8884d8"
                activeBar={<Rectangle fill="pink" stroke="blue" />}
                stackId="a"
              />
              <Bar
                dataKey="visits"
                name="الزيارات"
                fill="#82ca9d"
                activeBar={<Rectangle fill="gold" stroke="purple" />}
                stackId="a"
              />
              <Bar
                dataKey="salaries"
                name="الرواتب"
                fill="#7bc0e8"
                activeBar={<Rectangle fill="pink" stroke="blue" />}
                stackId="b"
              />
              <Bar
                dataKey="expenses"
                name="المصروفات"
                fill="#f7976a"
                activeBar={<Rectangle fill="gold" stroke="purple" />}
                stackId="b"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

type HeaderType = {
  header: string
  content: string
  Icon: IconType
  iconColor?: string
}

function HeaderCard({ header, content, Icon, iconColor = "" }: HeaderType) {
  return (
    <div className="flex items-center gap-4 px-8 py-5 rounded-lg border shadow-sm w-[290px]">
      <div
        className={cn(
          "grid rounded-lg text-primary-foreground bg-primary aspect-square w-11 h-11 place-items-center",
          iconColor
        )}
      >
        <Icon className="text-3xl" />
      </div>
      <div>
        <div className="text-xs font-medium text-card-foreground">{header}</div>
        <div className="text-lg font-bold">{content}</div>
      </div>
    </div>
  )
}
