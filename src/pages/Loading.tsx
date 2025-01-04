import { Loader2 } from "lucide-react"

type Props = {}

function Loading({}: Props) {
  return (
    <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin"/>
        </div>
  </div>
  )
}

export default Loading