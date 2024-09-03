import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/shadcn/accordion"

import { usePayment } from "@/queries"
import { formatCurrency, surrealDbId } from "@/lib/utils"
import { SurrealDbId } from "@/lib/types"
import PaymentsActions from "./PaymentsActions"
import { FaX } from "react-icons/fa6"
import DeleteItemPayment from "@/components/helpers/DeletePaymentItem"

export default function PendingPayments() {
  const {
    getUnpaidPayments: { data },
    getReboundPaymentsVisits: { data: reboundData }
  } = usePayment()
  console.log(reboundData)
  return (
    <div>
      <h1>الحسابات</h1>
      <hr />
      <div>
        {data && data.length > 0 ? (
          <Accordion
            type="single"
            collapsible
            className="max-w-[800px] border rounded-3xl p-6 mx-auto shadow-sm"
          >
            {data.map(
              ({ visit_id, visitor_phone, visitor_name, payment_items, amount, id }) => (
                <AccordionItem
                  value={surrealDbId(visit_id as SurrealDbId)}
                  key={surrealDbId(visit_id as SurrealDbId)}
                >
                  <AccordionTrigger className="flex items-baseline justify-start gap-2">
                    <span className="font-bold">{visitor_name}</span>
                    <span className="w-10 border-t" />
                    <span>{visitor_phone}</span>
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
                        {payment_items.map((item) => (
                          <tr key={item.id.id.String} className="w-full">
                            <td className="py-2">
                              {item.name === "treatment_cost" ? "حساب الجلسة" : item.name}
                            </td>
                            <td className="py-2">{formatCurrency(item.amount)}</td>
                            <td className="py-2">
                              <DeleteItemPayment paymentId={id} paymentItemId={item.id}>
                                <FaX />
                              </DeleteItemPayment>
                            </td>
                          </tr>
                        ))}
                        <tr className="w-full">
                          <th className="py-2 text-start">المجموع</th>
                          <th className="py-2 text-start" colSpan={2}>
                            {formatCurrency(amount)}
                          </th>
                        </tr>
                        <tr className="flex w-full py-2">
                          <td colSpan={3}>
                            <PaymentsActions
                              visitId={surrealDbId(visit_id as SurrealDbId)}
                              totalAmount={amount}
                              name={visitor_name}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </AccordionContent>
                </AccordionItem>
              )
            )}
          </Accordion>
        ) : (
          <div className="py-10 text-2xl font-medium text-center text-muted-foreground">
            لا توجد حسابات
          </div>
        )}
        {reboundData && reboundData.length > 0 && (
          <Accordion
            type="single"
            collapsible
            className="max-w-[800px] border rounded-3xl p-6 mx-auto shadow-sm"
          >
            {reboundData.map(
              ({ visit_id, visitor_phone, visitor_name, payment_items, amount, id }) => (
                <AccordionItem
                  value={surrealDbId(visit_id as SurrealDbId)}
                  key={surrealDbId(visit_id as SurrealDbId)}
                >
                  <AccordionTrigger className="flex items-baseline justify-start gap-2">
                    <span className="font-bold">{visitor_name}</span>
                    <span className="w-10 border-t" />
                    <span>{visitor_phone}</span>
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
                        {payment_items.map((item) => (
                          <tr key={item.id.id.String} className="w-full">
                            <td className="py-2">
                              {item.name === "treatment_cost" ? "حساب الجلسة" : item.name}
                            </td>
                            <td className="py-2">{formatCurrency(item.amount)}</td>
                            <td className="py-2">
                              <DeleteItemPayment paymentId={id} paymentItemId={item.id}>
                                <FaX />
                              </DeleteItemPayment>
                            </td>
                          </tr>
                        ))}
                        <tr className="w-full">
                          <th className="py-2 text-start">المجموع</th>
                          <th className="py-2 text-start" colSpan={2}>
                            {formatCurrency(amount)}
                          </th>
                        </tr>
                        <tr className="flex w-full py-2">
                          <td colSpan={3}>
                            <PaymentsActions
                              visitId={surrealDbId(visit_id as SurrealDbId)}
                              totalAmount={amount}
                              name={visitor_name}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </AccordionContent>
                </AccordionItem>
              )
            )}
          </Accordion>
        )}
      </div>
    </div>
  )
}
