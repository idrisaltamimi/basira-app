import { useState } from "react"

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
import { Payment } from "@/types/payment"
import { Button } from "@/components/ui/shadcn/button"

export default function PendingPayments() {
  const {
    getUnpaidPayments: { data }
  } = usePayment()
  const [rebound, setRebound] = useState<Payment | undefined>()

  return (
    <div>
      <h1>الحسابات</h1>
      <hr />
      <table className="w-full">
        <tr className="flex w-full pb-6">
          <th className="basis-full">
            <h2>المحاسبات</h2>
          </th>
          <th className="basis-16" />
          <th className="basis-[60%] flex items-center justify-between">
            {rebound && (
              <>
                <h2>أنهي محاسبة لـ {rebound.visitor_name}</h2>
                <Button
                  variant={"destructive"}
                  size="sm"
                  onClick={() => setRebound(undefined)}
                >
                  إلغاء
                </Button>
              </>
            )}
          </th>
        </tr>
        <tr className="flex w-full ">
          <td className="flex basis-full">
            {data && data.length > 0 ? (
              <Accordion
                type="single"
                collapsible
                className="border shadow-sm rounded-xl basis-full"
              >
                {data
                  .filter((i) => i.id.id !== rebound?.id.id)
                  .map((payment) => (
                    <AccordionItem
                      value={surrealDbId(payment.visit_id as SurrealDbId)}
                      key={surrealDbId(payment.visit_id as SurrealDbId)}
                    >
                      <AccordionTrigger className="flex items-baseline justify-start gap-2 p-6 font-bold text-start">
                        <span className="basis-full">{payment.visitor_name}</span>
                        <span className="basis-full">{payment.visitor_phone}</span>
                      </AccordionTrigger>
                      <AccordionContent className="p-0 bg-transparent">
                        <table className="w-full bg-primary/5">
                          <thead>
                            <tr className="w-full border-b border-primary/15">
                              <th className="px-4 py-2 text-start">نوع المحاسبة</th>
                              <th className="px-4 py-2 text-start">السعر</th>
                              <th className="px-4 py-2 text-start">إلغاء</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payment.payment_items.map((item) => (
                              <tr key={item.id.id.String} className="w-full">
                                <td className="px-4 py-2">
                                  {item.name === "treatment_cost"
                                    ? "حساب الجلسة"
                                    : item.name}
                                </td>
                                <td className="px-4 py-2">
                                  {formatCurrency(item.amount)}
                                </td>
                                <td className="px-4 py-2">
                                  <DeleteItemPayment
                                    paymentId={payment.id}
                                    visitId={payment.visit_id as SurrealDbId}
                                    paymentItemId={item.id}
                                    paymentItemName={item.name}
                                  >
                                    <FaX />
                                  </DeleteItemPayment>
                                </td>
                              </tr>
                            ))}
                            <tr className="w-full">
                              <th className="px-4 py-2 text-start">المجموع</th>
                              <th className="px-4 py-2 text-start" colSpan={2}>
                                {formatCurrency(payment.amount)}
                              </th>
                            </tr>
                            <tr className="flex w-full px-4 py-2">
                              <td colSpan={3}>
                                <Button size={"sm"} onClick={() => setRebound(payment)}>
                                  إنهاء المحاسبة
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
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
            {rebound && (
              <div className="text-sm border rounded-xl">
                <table className="w-full">
                  <thead>
                    <tr className="w-full border-b bg-primary/5">
                      <th className="px-4 py-2 text-start">نوع المحاسبة</th>
                      <th className="px-4 py-2 text-start">السعر</th>
                      <th className="px-4 py-2 text-start">إلغاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rebound.payment_items.map((item) => (
                      <tr key={item.id.id.String} className="w-full">
                        <td className="px-4 py-2">
                          {item.name === "treatment_cost" ? "حساب الجلسة" : item.name}
                        </td>
                        <td className="px-4 py-2">{formatCurrency(item.amount)}</td>
                        <td className="px-4 py-2">
                          <DeleteItemPayment
                            paymentId={rebound.id}
                            visitId={rebound.visit_id as SurrealDbId}
                            paymentItemId={item.id}
                            paymentItemName={item.name}
                          >
                            <FaX />
                          </DeleteItemPayment>
                        </td>
                      </tr>
                    ))}
                    <tr className="w-full">
                      <th className="px-4 py-2 text-start">المجموع</th>
                      <th className="px-4 py-2 text-start" colSpan={2}>
                        {formatCurrency(
                          rebound.payment_items.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          )
                        )}
                      </th>
                    </tr>
                    <tr className="w-full">
                      <td colSpan={3} className="px-4 py-2">
                        <PaymentsActions
                          visitId={surrealDbId(rebound.visit_id as SurrealDbId)}
                          totalAmount={rebound.payment_items.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          )}
                          name={rebound.visitor_name}
                          setRebound={setRebound}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      </table>
    </div>
  )
}
