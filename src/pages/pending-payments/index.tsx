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

  return (
    <div>
      <h1>الحسابات</h1>
      <hr />
      <table className="w-full ">
        <tr className="flex w-full pb-6">
          <th className="basis-full">
            <h2>المحاسبات الجديدة</h2>
          </th>
          <th className="basis-16" />
          <th className="basis-[60%]">
            <h2>آخر محاسبة</h2>
          </th>
        </tr>
        <tr className="flex w-full ">
          <td className="flex basis-full">
            {data && data.length > 0 ? (
              <Accordion
                type="single"
                collapsible
                className="p-6 border shadow-sm rounded-3xl basis-full"
              >
                {data.map(
                  ({
                    visit_id,
                    visitor_phone,
                    visitor_name,
                    payment_items,
                    amount,
                    id
                  }) => (
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
                                  {item.name === "treatment_cost"
                                    ? "حساب الجلسة"
                                    : item.name}
                                </td>
                                <td className="py-2">{formatCurrency(item.amount)}</td>
                                <td className="py-2">
                                  <DeleteItemPayment
                                    paymentId={id}
                                    paymentItemId={item.id}
                                  >
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
              <div className="py-10 text-2xl font-medium text-center basis-full text-muted-foreground">
                لا توجد حسابات
              </div>
            )}
          </td>
          <td className="flex items-center justify-center basis-16">
            <div className="w-[1px] max-h-[1000px] h-full bg-black opacity-10 rounded-full" />
          </td>
          <td className="basis-[60%]">
            {reboundData && reboundData.length > 0 && (
              <Accordion
                type="single"
                collapsible
                className="max-w-[800px] border rounded-3xl p-6 mx-auto shadow-sm"
              >
                {reboundData.map(
                  ({
                    visit_id,
                    visitor_phone,
                    visitor_name,
                    payment_items,
                    amount,
                    id
                  }) => (
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
                                  {item.name === "treatment_cost"
                                    ? "حساب الجلسة"
                                    : item.name}
                                </td>
                                <td className="py-2">{formatCurrency(item.amount)}</td>
                                <td className="py-2">
                                  <DeleteItemPayment
                                    paymentId={id}
                                    paymentItemId={item.id}
                                  >
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
                          </tbody>
                        </table>
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </Accordion>
            )}
          </td>
        </tr>
      </table>
    </div>
  )
}
