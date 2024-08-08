import { ChangeEvent, FormEvent, useState } from "react"

import { useAuth } from "@/queries"
import Spinner from "@/components/ui/Spinner"
import logoBg from "../../assets/logo.svg"

import { Button } from "@/components/ui/shadcn/button"
import { TextField } from "@/components"

export default function Auth() {
  const [formData, setFormData] = useState({
    civilId: "87654321",
    password: "123456"
  })

  const [errorMessage, setErrorMessage] = useState("")

  const { signIn } = useAuth()

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    const parsedCivilId = parseInt(formData.civilId)

    if (isNaN(parsedCivilId) || formData.civilId.trim() !== parsedCivilId.toString()) {
      setErrorMessage("الرقم المدني غير صالح!")
      return
    }

    await signIn.mutate({ civilId: parsedCivilId, password: formData.password })
    const res = await signIn.data

    if (signIn.isSuccess && res == undefined) {
      setErrorMessage("خطأ في الرقم المدني أو كلمة المرور!")
    }
  }

  return (
    <div className="relative grid h-full place-items-center">
      <form
        onSubmit={handleSubmit}
        className="max-w-[700px] w-full mx-auto z-50 relative bg-white/20 backdrop-blur-md border rounded-3xl p-6 flex flex-col gap-6"
      >
        <h1>تسجيل الدخول</h1>
        <hr />
        <TextField
          label="الرقم المدني"
          id="civilId"
          name="civilId"
          type="number"
          value={formData.civilId}
          onChange={handleChange}
          required
        />

        <TextField
          label="كلمة المرور"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <p className="text-sm text-red-500">{errorMessage}</p>

        <Button className="flex items-center w-1/2 gap-4" type="submit">
          تسجيل الدخول
          {signIn.isPending && <Spinner />}
        </Button>
      </form>

      <img
        src={logoBg}
        alt=""
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none h-full left-1/2 top-1/2 aspect-square object-fit opacity-[6%]"
      />
    </div>
  )
}
// $2b$10$92qwkrhZcUtJAtjvqZa8QO9C8.7GO6hlbQkJFH9/B1Js0IiY6PJQe
// uGNhHnN4g+pE$mP
// trial
// bn?NNsSTCy3F?9E
// trial2
