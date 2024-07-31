import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { TextField } from "@/components/form/Textfield"
import { useUser } from "@/hooks"
import { Button } from "@/components/ui/shadcn/button"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { DatePickerWrapper } from "@/components"
import ReactDatePicker from "react-datepicker"
import { surrealDbId } from "@/lib/utils"

import "react-datepicker/dist/react-datepicker.css"
import { toast } from "@/components/ui/use-toast"
import { ImSpinner2 } from "react-icons/im"

const initialNewPassword = {
  password: "",
  confirmPassword: "",
  newPasswordError: ""
}

const INITIAL_FORM_DATA: {
  name: string
  password: string
  email: string
  phone: string
  birthdate: Date | null
} = {
  name: "",
  password: "",
  email: "",
  phone: "",
  birthdate: new Date()
}

export default function Settings() {
  const { userData, updateUser } = useUser()

  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  const [showPassword, setShowPassword] = useState(false)
  const [disablePassword, setDisablePassword] = useState(true)
  const [newPassword, setNewPassword] = useState(initialNewPassword)

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData?.name,
        password: "",
        email: userData?.email,
        phone: userData?.phone.toString(),
        birthdate: userData.birthdate ? new Date(userData.birthdate) : null
      })
    }
  }, [userData?.id])

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setNewPassword((prev) => ({ ...prev, [name]: value }))
  }

  const saveNewPassword = () => {
    if (newPassword.password !== newPassword.confirmPassword) {
      return setNewPassword((prev) => ({
        ...prev,
        newPasswordError: "كلمات المرور غير متطابقة"
      }))
    }

    setFormData((prev) => ({
      ...prev,
      password: newPassword.password
    }))
    setNewPassword(initialNewPassword)
    setDisablePassword(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!userData?.id) return

    updateUser.mutate(
      {
        ...formData,
        birthdate: formData.birthdate as Date,
        id: surrealDbId(userData?.id),
        password: formData.password === "" ? undefined : formData.password
      },
      {
        onSuccess: () => {
          toast({
            title: "تم تحديث البيانات بنجاح",
            duration: 3000
          })
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "!حدث خطأ ما! حاول مرة أخرى",
            duration: 3000
          })
        }
      }
    )
  }

  return (
    <div>
      <h1>الحساب الشخصي</h1>

      <hr className="mt-4 mb-8" />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 p-6 border border-input shadow-sm max-w-[800px] rounded-3xl mx-auto"
      >
        <TextField
          label="الاسم"
          name="name"
          value={formData?.name}
          onChange={handleChange}
        />

        <TextField
          label="البريد الالكتروني"
          type="email"
          name="email"
          value={formData?.email}
          onChange={handleChange}
        />

        <TextField
          label="رقم الهاتف"
          name="phone"
          value={formData?.phone}
          onChange={handleChange}
        />

        <DatePickerWrapper label="تاريخ الميلاد*" className="bg-background">
          <ReactDatePicker
            className="datepicker"
            selected={formData.birthdate}
            onChange={(date) => setFormData((prev) => ({ ...prev, birthdate: date }))}
          />
        </DatePickerWrapper>

        {disablePassword && (
          <div className="flex items-end max-w-[600px] gap-2 w-1/2">
            <TextField
              label="كلمة المرور"
              type="password"
              name="password"
              value={formData?.password}
              className="text-transparent"
              disabled
              onChange={handleChange}
            />

            <Button
              type="button"
              size="sm"
              variant="outline"
              className={`mb-[3px] ${!disablePassword && "opacity-0"}`}
              onClick={() => setDisablePassword(false)}
              disabled={!disablePassword}
            >
              {disablePassword ? "تعديل" : "حفظ"}
            </Button>
          </div>
        )}

        {!disablePassword && (
          <div className="w-full">
            <div className="flex items-center w-full gap-4">
              <TextField
                label="كلمة المرور الجديدة"
                name="password"
                value={newPassword.password}
                type={showPassword ? "text" : "password"}
                Icon={
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                }
                iconEnd
                onChange={handlePasswordChange}
              />

              <TextField
                label="تأكيد كلمة المرور"
                name="confirmPassword"
                value={newPassword.confirmPassword}
                type={showPassword ? "text" : "password"}
                Icon={
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                }
                iconEnd
                onChange={handlePasswordChange}
              />
            </div>

            <div className="text-sm text-red-500">{newPassword.newPasswordError}</div>

            <div className="flex items-center gap-2 mt-2">
              <Button type="button" size="sm" className="w-20" onClick={saveNewPassword}>
                تغيير
              </Button>
              <Button
                type="button"
                size="sm"
                className="w-20"
                variant="outline"
                onClick={() => {
                  setNewPassword(initialNewPassword)
                  setDisablePassword(true)
                }}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}

        <Button disabled={updateUser.isPending} className="mt-4">
          {updateUser.isPending ? (
            <ImSpinner2 className="text-xl animate-spin" />
          ) : (
            "حفظ التغييرات"
          )}
        </Button>
      </form>
    </div>
  )
}
