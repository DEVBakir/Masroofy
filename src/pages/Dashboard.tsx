import { useNavigate } from "react-router-dom";
import supabaseClient from "@/config/supabaseClient";
import { Transaction, UserSettings } from "@/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import Loading from "./Loading";
import { Button } from "@/components/ui/button";
import CreateTransactionDialog from "@/components/CreateTransactionDialog";
import { useAuth } from "../auth/AuthContext"
import { ReactNode, useCallback, useMemo, useState } from "react";
import { addMonths, startOfMonth } from "date-fns";
import { DateRangePicker } from "@/components/ui/data-range-picker-custom";
import SkeletonWrapper from "@/components/SkeleonWrapper";
import { Card } from "@/components/ui/card";
import CountUp from 'react-countup';
import { TrendingUp } from "lucide-react";
import { number } from "zod";

type Props = {};

function Dashboard({}: Props) {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); 

  const user_id = user?.id;

  const { data: userSettings, error, isLoading , refetch : userSettingsRefetch} = useQuery<UserSettings | null>({
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
      <div className="border-b bg-card w-full">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8 mx-auto px-4 lg:px-0">
          <p className="sm:text-3xl text-2xl font-bold">Hello, {user?.user_metadata?.name || user?.email?.split('@')[0]} 👋</p>
          <div className="flex items-center gap-3">
            <CreateTransactionDialog successCallBack={()=> userSettingsRefetch} trigger={
                <Button variant={"outline"} className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white">
                New income 🤑
                </Button>
            } type="income"/>
            <CreateTransactionDialog successCallBack={()=> userSettingsRefetch} trigger={
                <Button variant={"outline"} className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white">
                New expense 😤
              </Button>
            } type="expense"/>
          </div>
        </div>
      </div>
      <Overview userSettings={userSettings}/>
    </div>
  );
}

export default Dashboard;


function Overview ({userSettings : UserSettings})  {
  const [dateRange , setDateRange ] = useState<{from:Date; to:Date}>({from:startOfMonth(new Date()) ,to:  addMonths(new Date(),1)});

  return (
    <div className="container flex flex-wrap items-center justify-between gap-6 py-8 mx-auto px-4 lg:px-0">
      <h2 className="text-3xl font-bold ">
        Overview
      </h2>
      <div className="flex items-center gap-3">
          <DateRangePicker 
            initialDateFrom={dateRange.from} 
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={(values)=> {
              const {from , to} = values.range

              if(!from || !to) return 
              setDateRange({from,to});
            }}
          /> 
          <StatsCard
            userSettings={UserSettings}
            from={dateRange.from}
            to={dateRange.to}
          />
      </div>
    </div>
  )
}

function StatsCard({
  userSettings,
  from,
  to,
}: {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}) {
  const { user } = useAuth();

  const formatter = useMemo(() => {
    // Default to 'en-US' if language is not available in userSettings
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userSettings.currency,
    });
  }, [userSettings.currency]);

  // Use the `useQuery` hook directly in the component
  const { data, error, isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions", from, to], // Ensure uniqueness in cache
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("Transaction")
        .select("*")
        .eq("user_id", user?.id) // Filter by the user
        .gte("date", from.toISOString()) // Greater than or equal to startDate
        .lte("date", to.toISOString()); // Less than or equal to endDate

      if (error) {
        console.error("Error fetching transactions:", error);
        throw new Error("Failed to fetch transactions");
      }
      return data || [];
    },
  });

  // Log errors for debugging
  if (error) {
    console.error("Query Error:", error);
  }

  const totalIncome = data
    ? data
        .filter((transaction) => transaction.type === "income")
        .reduce(
          (sum, transaction) => sum + (transaction.amount),
          0
        )
    : 0;

  return (
    <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={isLoading}>
        <StatCard
          formatter={formatter}
          userSetting={userSettings}
          title="income"
          value={totalIncome}
          icon={
            <TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" />
          }
        />
      </SkeletonWrapper>
    </div>
  );
}

function StatCard({
  value,
  title,
  icon,
  userSetting,
  formatter,
}: {
  icon: ReactNode;
  title: string;
  value: number;
  userSetting: UserSettings;
  formatter: Intl.NumberFormat;
}) {
  // Format the value using the provided formatter
  const formatFn = useCallback(
    (value: number) => {
      return formatter.format(value);
    },
    [formatter]
  );

  return (
    <Card className="flex h-24 w-full items-center gap-2 p-4">
      {icon}
      <div className="flex flex-col items-center gap-0">
        <p className="text-muted-foreground">{title}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className="text-xl"
        />
      </div>
    </Card>
  );
}