import { CurrencyComboBox } from "@/components/CurrencyComboBox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"

type Props = {}

function Welcome({}: Props) {
  const user = {
    id: "2",
    firstName: "bakir"
  }

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      <div className="container flex max-w-2xl flex-col items-center justify-between gap-4 px-5 md:px-0">
        <div>
          <h1 className="text-center text-3xl">
            Welcome, <span className="ml-2 font-bold capitalize">{user.firstName}  👋</span>
          </h1>
          <h2 className="mt-4 text-center text-base text-muted-foreground">
            Let 's get started by setting up your currency
          </h2>
          <h3 className="mt-2 text-center text-sm text-muted-foreground">
            You can change these settings at any time
          </h3>
        </div>
        <Separator />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>Set your default currency for transactions</CardDescription>
            <CardContent className="p-0 pt-6 pr-0">
              <CurrencyComboBox />
            </CardContent>
          </CardHeader>
        </Card>
        <Separator />
        <Button className="w-full" asChild>
          <Link to="/" className="font-semibold">
            I'm done Take me to the dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default Welcome