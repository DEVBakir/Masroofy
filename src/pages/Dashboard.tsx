import { useNavigate } from "react-router-dom";
import supabaseClient from "@/config/supabaseClient";
import { UserSettings } from "@/schema";
import { useQuery } from "@tanstack/react-query";
import Loading from "./Loading";
import { Button } from "@/components/ui/button";
import CreateTransactionDialog from "@/components/CreateTransactionDialog";

type Props = {};

function Dashboard({}: Props) {
  const navigate = useNavigate();

  const user_id = "39e34f1f-6d09-4eca-9cdd-3e01e52a3c55";

  const { data: userSettings, error, isLoading } = useQuery<UserSettings | null>({
    queryKey: ["userSettings", user_id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("UserSettings")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  // Redirect to /welcome if no user settings are found
  if (!isLoading && !userSettings) {
    navigate("/welcome");
  }

  // Show a loading page while data is being fetched
  if (isLoading) {
    return (
     <Loading />
    );
  }

  // Render the main dashboard content
  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8 mx-auto px-4 lg:px-0">
          <p className="sm:text-3xl text-2xl font-bold">Hello, Bakir 👋</p>
          <div className="flex items-center gap-3">
            <CreateTransactionDialog trigger={
                <Button variant={"outline"} className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white">
                New income 🤑
                </Button>
            } type="income"/>
            <CreateTransactionDialog trigger={
                <Button variant={"outline"} className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white">
                New expense 😤
              </Button>
            } type="expense"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
