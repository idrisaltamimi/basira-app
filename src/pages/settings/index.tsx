import { ChangeEvent, FormEvent, useState } from "react"
import { TextField, TextFieldProps } from "@/components/form/Textfield"
import { useUser } from "@/hooks"
import { Button } from "@/components/ui/shadcn/button"
import { User } from "@/types/user"
import { FaEye, FaEyeSlash } from "react-icons/fa"

export default function Settings() {
  const {
    userData,
    userForm,
    saveNewPassword,
    disablePassword,
    setDisablePassword,
    setNewPassword,
    newPassword,
    handleChange,
    handlePasswordChange,
    updateUser
  } = useSettings()
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    updateUser.mutate(userForm)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">الحساب الشخصي</h2>

      <hr className="mt-4 mb-8" />

      <form onSubmit={handleSubmit} className="flex flex-col items-start gap-6">
        <TextFieldWrapper
          label="الاسم"
          name="name"
          value={userForm?.name}
          onChange={handleChange}
        />

        <TextFieldWrapper
          label="البريد الالكتروني"
          type="email"
          name="email"
          value={userForm?.email}
          onChange={handleChange}
        />

        <TextFieldWrapper
          label="رقم الهاتف"
          name="phone"
          value={userForm?.phone}
          onChange={handleChange}
        />

        {disablePassword && (
          <div className="flex items-end max-w-[600px] gap-2 w-full">
            <TextField
              label="كلمة المرور"
              type="password"
              name="password"
              value={userForm?.password}
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
          <div className="max-w-[600px] w-full">
            <div className="max-w-[600px] w-full flex items-center gap-4">
              <TextField
                label="كلمة المرور الجديدة"
                name="password"
                value={newPassword.password}
                type={showPassword ? "text" : "password"}
                Icon={
                  <Button
                    size={"icon"}
                    variant={"ghost"}
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

        <Button
          disabled={JSON.stringify(userForm) === JSON.stringify(userData)}
          className="mt-4"
        >
          حفظ التغييرات
        </Button>
      </form>
    </div>
  )
}

interface TextFieldWrapperProps extends TextFieldProps {}

function TextFieldWrapper({ ...props }: TextFieldWrapperProps) {
  const [disableInput, setDisableInput] = useState(true)

  return (
    <div className="flex items-end max-w-[600px] gap-2 w-full">
      <TextField {...props} disabled={disableInput} />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mb-[3px]"
        onClick={() => setDisableInput((prev) => !prev)}
      >
        {disableInput ? "تعديل" : "حفظ"}
      </Button>
    </div>
  )
}

const initialNewPassword = {
  password: "",
  confirmPassword: "",
  newPasswordError: ""
}

function useSettings() {
  const { userData, updateUser } = useUser()

  const [userForm, setUserForm] = useState(userData as User)
  const [disablePassword, setDisablePassword] = useState(true)
  const [newPassword, setNewPassword] = useState(initialNewPassword)

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setUserForm((prev) => ({ ...prev, [name]: value }))
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

    setUserForm((prev) => ({
      ...prev,
      password: newPassword.password
    }))
    setNewPassword(initialNewPassword)
    setDisablePassword(true)
  }

  return {
    saveNewPassword,
    userForm,
    disablePassword,
    setDisablePassword,
    newPassword,
    handleChange,
    handlePasswordChange,
    updateUser,
    userData,
    setUserForm,
    setNewPassword
  }
}
