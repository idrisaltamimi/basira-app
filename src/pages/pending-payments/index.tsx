import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/shadcn/accordion"

import { usePayment } from "@/hooks"
import { Payment } from "@/types/payment"
import { formatCurrency, surrealDbId } from "@/lib/utils"
import { SurrealDbId } from "@/lib/types"
import DeletePayment from "@/components/helpers/DeletePayment"
import PaymentsActions from "./PaymentsActions"
import { FaX } from "react-icons/fa6"

type GroupedPayments = {
  payments: Payment[]
  visit_id: SurrealDbId
  visitor_phone: string
  visitor_name: string
}

export default function PendingPayments() {
  const { getUnpaidPayments } = usePayment()

  const payments = getUnpaidPayments.data ?? []
  const groupedPayments = groupPaymentsByVisit(payments)

  const paymentSum = (values: Payment[]) =>
    values.reduce((acc, cur) => acc + cur.amount, 0)
  console.log(groupedPayments)
  return (
    <div>
      <h1>الحسابات</h1>
      <hr />
      {payments.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          className="max-w-[800px] border rounded-3xl p-6 mx-auto shadow-sm"
        >
          {Object.entries(groupedPayments).map(([visitId, group]) => (
            <AccordionItem value={visitId} key={visitId}>
              <AccordionTrigger className="flex items-baseline justify-start gap-2">
                <span className="font-bold">{group.visitor_name}</span>
                <span className="w-10 border-t" />
                <span>{group.visitor_phone}</span>
              </AccordionTrigger>
              <AccordionContent className="bg-transparent">
                <table className="w-full">
                  <thead>
                    <tr className="w-full border-b">
                      <th className="py-2 text-start">نوع المحاسبة</th>
                      <th className="py-2 text-start">السعر</th>
                      <th className="py-2 text-start">إلغاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.payments.map((payment) => (
                      <tr key={payment.id.id.String} className="w-full">
                        <td className="py-2">{payment.name}</td>
                        <td className="py-2">{formatCurrency(payment.amount)}</td>
                        <td className="py-2">
                          <DeletePayment paymentId={payment.id}>
                            <FaX />
                          </DeletePayment>
                        </td>
                      </tr>
                    ))}
                    <tr className="w-full">
                      <th className="py-2 text-start">المجموع</th>
                      <th className="py-2 text-start" colSpan={2}>
                        {formatCurrency(paymentSum(group.payments))}
                      </th>
                    </tr>
                    <tr className="flex w-full py-2">
                      <td colSpan={3}>
                        <PaymentsActions
                          visitId={visitId}
                          totalAmount={paymentSum(group.payments)}
                          name={group.visitor_name}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="py-10 text-2xl font-medium text-center text-muted-foreground">
          لا توجد حسابات
        </div>
      )}
    </div>
  )
}

const groupPaymentsByVisit = (payments: Payment[]): Record<string, GroupedPayments> => {
  return payments.reduce((acc, payment) => {
    const { visit_id, visitor_phone, visitor_name } = payment
    const visitId = visit_id as SurrealDbId

    if (!acc[surrealDbId(visitId)]) {
      acc[surrealDbId(visitId)] = {
        visit_id: visitId,
        visitor_phone,
        visitor_name,
        payments: []
      }
    }
    acc[surrealDbId(visitId)].payments.push(payment)
    return acc
  }, {} as Record<string, GroupedPayments>)
}
