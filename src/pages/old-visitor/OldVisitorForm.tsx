import { FormEvent, useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"

import { Button } from "@/components/ui/shadcn/button"
import { TextField } from "@/components/form/Textfield"
import { Visitor } from "@/lib/types"
import { useVisitor } from "@/queries"
import { surrealDbId } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export function OldVisitorForm() {
  const { createNewVisit } = useVisitor()

  const [visitors, setVisitors] = useState<Visitor[] | undefined>(undefined)
  const [visitorId, setVisitorId] = useState("")
  const [searchPhone, setSearchPhone] = useState("")

  const handleSearch = async (searchPhone: string) => {
    try {
      const data: Visitor[] = await invoke("get_visitors", {
        number: parseInt(searchPhone)
      })
      setVisitors(data)
    } catch (error) {
      toast({
        title: "حدث خطأ ما!",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    if (searchPhone.length < 7) {
      return setVisitors(undefined)
    }

    const timer = setTimeout(() => {
      handleSearch(searchPhone)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchPhone])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    createNewVisit.mutate(visitorId, {
      onSuccess: () => {
        setSearchPhone("")
        setVisitors(undefined)
      }
    })
  }

  return (
    <form
      className="flex flex-col h-full max-w-[800px] mx-auto border border-input p-6 rounded-3xl"
      onKeyDown={(e) => {
        e.key === "Enter" && e.preventDefault()
      }}
      onSubmit={onSubmit}
    >
      <TextField
        label="رقم هاتف الزائر"
        type="number"
        name="search-visitor"
        maxLength={9}
        onChange={(e) => {
          const inputVal = (e.target as HTMLInputElement).value
          if (/^\d{0,9}$/.test(inputVal)) {
            setSearchPhone(inputVal)
          }
        }}
        value={searchPhone}
      />

      {visitors && visitors.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-col gap-1">
            {visitors.map((visitor) => (
              <SearchVisitorsList
                key={surrealDbId(visitor.id)}
                visitor={visitor}
                visitorId={visitorId}
                setVisitorId={setVisitorId}
              />
            ))}
          </div>

          <Button className="w-full mt-8" disabled={visitorId === ""}>
            افتح زيارة
          </Button>
        </div>
      )}

      {visitors && visitors.length === 0 && (
        <div className="w-full h-full py-10 text-2xl text-center text-muted-foreground">
          لا يوجد زائر مسجل بهذا الرقم
        </div>
      )}
    </form>
  )
}

type SearchVisitorsListProps = {
  visitor: Visitor
  visitorId: string
  setVisitorId: React.Dispatch<React.SetStateAction<string>>
}

function SearchVisitorsList({
  visitor,
  visitorId,
  setVisitorId
}: SearchVisitorsListProps) {
  return (
    <Button
      variant={surrealDbId(visitor.id) === visitorId ? "secondary" : "ghost"}
      className={"flex items-center justify-between w-full py-6 border"}
      type="button"
      onClick={() => setVisitorId(visitor.id.id.String)}
    >
      <div className="font-semibold ">{visitor.name}</div>
      <div className="text-xs">{visitor.phone}</div>
    </Button>
  )
}
