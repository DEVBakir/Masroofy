import { data, useNavigate } from "react-router-dom";
import supabaseClient from "@/config/supabaseClient";
import { Category, Transaction, UserSettings } from "@/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import Loading from "./Loading";
import { Button } from "@/components/ui/button";
import CreateTransactionDialog from "@/components/CreateTransactionDialog";
import { useAuth } from "../auth/AuthContext"
import { Children, createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addMonths, startOfMonth } from "date-fns";
import { DateRangePicker } from "@/components/ui/data-range-picker-custom";
import SkeletonWrapper from "@/components/SkeleonWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from 'react-countup';
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { number } from "zod";
import { Period, TimeFrame, TransactionType } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";


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
    <UserTransactionsProvider>
       <div className="h-full bg-background">
        <div className="border-b bg-card w-full">
          <div className="container flex flex-wrap items-center justify-between gap-6 py-8 mx-auto px-4 lg:px-0">
            <p className="sm:text-3xl text-2xl font-bold">Hello, {user?.user_metadata?.name || user?.email?.split('@')[0]} 👋</p>
            <div className="flex items-center gap-3">
              <CreateTransactionDialog successCallBack={()=> {}} trigger={
                  <Button variant={"outline"} className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white">
                  New income 🤑
                  </Button>
              } type="income"/>
              <CreateTransactionDialog successCallBack={()=> {}} trigger={
                  <Button variant={"outline"} className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white">
                  New expense 😤
                </Button>
              } type="expense"/>
            </div>
          </div>
        </div>
        <Overview userSettings={userSettings}/>
        <History userSettings={userSettings}/>
      </div>
    </UserTransactionsProvider>
  );
}

export default Dashboard;


function Overview ({userSettings })  {
  const {dateRange,setDateRange} = useContext(UserTransactions);
  return (
    <div className="container flex flex-wrap items-center justify-between gap-6 py-5 mx-auto px-4 lg:px-0">
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
      </div>
      <div className="container flex w-full gap-2 flex-col">
      <StatsCard
            userSettings={userSettings}
            from={dateRange.from}
            to={dateRange.to}
          />
        
        <CategoryStats userSettings={userSettings} from={dateRange.from} to={dateRange.to}/>
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

  const { data, error, isLoading } = useContext(UserTransactions);

  // Log errors for debugging
  if (error) {
    console.error("Query Error:", error);
  }

  const income = data
    ? data
        .filter((transaction) => transaction.type === "income")
        .reduce(
          (sum, transaction) => sum + (transaction.amount),
          0
        )
    : 0;

    const expense = data
    ? data
        .filter((transaction) => transaction.type === "expense")
        .reduce(
          (sum, transaction) => sum + (transaction.amount),
          0
        )
    : 0;

    const balance = data
    ? data
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
          value={income}
          icon={
            <TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" />
          }
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={isLoading}>
        <StatCard
          formatter={formatter}
          userSetting={userSettings}
          title="expense"
          value={expense}
          icon={
            <TrendingDown className="h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10" />
          }
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={isLoading}>
        <StatCard
          formatter={formatter}
          userSetting={userSettings}
          title="balance"
          value={balance}
          icon={
            <Wallet className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />
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

function CategoryStats ({userSettings,from,to} : {userSettings:UserSettings;from:Date;to:Date}) {
  const { user } = useAuth();
  const { data,isLoading }= useContext(UserTransactions)

  const formatter = useMemo(() => {
    // Default to 'en-US' if language is not available in userSettings
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userSettings.currency,
    });
  }, [userSettings.currency]);

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={isLoading}>
        <CategoriesCard 
          formatter={formatter}
          type="income"
          data={data}
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={false}>
        <CategoriesCard 
          formatter={formatter}
          type="expense"
          data={data}
        />
      </SkeletonWrapper>
    </div>
  )
}

function CategoriesCard({ data, type, formatter }: {
  type: TransactionType, 
  formatter: Intl.NumberFormat, 
  data: any[]
}) {
  // Filter data by type (income or expense)
  let filterData = data?.filter((el) => el.type === type);

  // Group filtered data by category_id
  let groupedByCategory = filterData?.reduce((acc, transaction) => {
    const categoryId = transaction.category_id;

    // Initialize the category array if it's not already present
    if (!acc[categoryId]) {
      acc[categoryId] = { categoryId, transactions: [] };
    }
    acc[categoryId].transactions.push(transaction);

    return acc;
  }, {}); // Start with an empty object

  // Convert groupedByCategory object into an array for easy iteration
  let groupedEntries = groupedByCategory ? Object.entries(groupedByCategory) : [];

  const total = data
  ? data
      .filter((transaction) => transaction.type === type)
      .reduce(
        (sum, transaction) => sum + (transaction.amount),
        0
      )
  : 0;


  return (
    <Card className="h-80 w-full col-span-6">
      <CardHeader>
        <CardTitle className="grid grid-flow-row justify-between gap-2 text-foreground md:grid-flow-col capitalize">
          {type + "s"} by category
        </CardTitle>
      </CardHeader>
      <div className="flex items-center justify-between gap-2">
        {
          filterData?.length === 0 ? (
            <div className="flex h-60 w-full flex-col items-center justify-center">
              No data for the selected period
              <p className="text-sm text-muted-foreground">
                Try selecting a different period or add new {type + "s"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-60 w-full px-4">
              <div className="flex w-full flex-col gap-4 p-4">
                {
                  groupedEntries.map(([categoryId, details]: [string, any]) => {
                    const transactions = details.transactions as any[]; // Cast transactions to any[]
                    const category = transactions[0]?.Category; // Assuming category data exists
                    const amount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
                    const percentage = (amount * 100) / total;
                  
                    return (
                      <div key={categoryId} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-gray-400">
                            {category?.icon} {category?.name}
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({percentage.toFixed(2)}%)
                            </span>
                          </span>
                          <span className="text-sm text-grey-400">
                            {formatter.format(amount)}
                          </span>
                        </div>
                        <Progress
                          value={percentage}
                          indicator={type === "income" ? "bg-emerald-500" : "bg-red-500"}
                        />
                      </div>
                    );
                  })
                }
              </div>
            </ScrollArea>
          )
        }
      </div>
    </Card>
  );
}

export const UserTransactions = createContext(null)

export const UserTransactionsProvider = ({ children }) => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: addMonths(new Date(), 1),
  });

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["transaction-with-category", dateRange.from, dateRange.to],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("Transaction")
        .select(
          `
          id,
          created_at,
          date,
          amount,
          description,
          user_id,
          category_id,
          type,
          Category (name, type, icon)
        `
        )
        .eq("user_id", user?.id)
        .gte("date", dateRange.from.toISOString()) // Filter transactions with date >= from
        .lte("date", dateRange.to.toISOString()); // Filter transactions with date <= to

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },

  });

  const { data:dataAll, refetch:refetchAll, isLoading:isLoadingAll } = useQuery({
    queryKey: ["transaction-with-category"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("Transaction")
        .select(
          `
          id,
          created_at,
          date,
          amount,
          description,
          user_id,
          category_id,
          type,
          Category (name, type, icon)
        `
        )
        .eq("user_id", user?.id)
      if (error) {
        throw new Error(error.message);
      }

      return data;
}})
  // Extract unique years
  const uniqueYears = useMemo(() => {
    if (!dataAll || !Array.isArray(dataAll)) return [];

    const years = dataAll.map((item) => new Date(item.date).getFullYear())
    return Array.from(new Set(years));
  }, [dataAll]);
   
   let isCurrentYearExist = uniqueYears.some((year) => {
    return year === new Date().getFullYear()
   })
  
  if(!isCurrentYearExist)
    uniqueYears.push(new Date().getFullYear())

    uniqueYears.sort()
  return (
    <UserTransactions.Provider
      value={{ data, refetch, isLoading, dateRange, setDateRange, uniqueYears,dataAll,refetchAll,isLoadingAll }}
    >
      {children}
    </UserTransactions.Provider>
  );
};


function History({userSettings} : {userSettings:UserSettings}) {
  const { user } = useAuth();
  const {dataAll,uniqueYears,isLoadingAll} = useContext(UserTransactions)
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("month");
  const [period,setPeriod] = useState<Period>(
    {
      month: new Date().getMonth(),
      year: new Date().getFullYear()
    }
  );
  const formatter = useMemo(() => {
    // Default to 'en-US' if language is not available in userSettings
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userSettings.currency,
    });
  }, [userSettings.currency]);

  
 const calculateMonthlySums = (dataAll, uniqueYears) => {
  return uniqueYears.map((year) => {
    // Initialize an array of 12 months with default values
    const monthlySums = Array.from({ length: 12 }, (_, month) => ({
      month: month + 1, // Month index starts at 0, so we add 1 for 1-based indexing
      expense: 0,
      income: 0,
    }));

    // Filter transactions for the current year
    const transactionsForYear = dataAll?.filter((item) => 
      new Date(item.date)?.getFullYear() === year
    );

    // Calculate sums for each month
    transactionsForYear?.forEach((transaction) => {
      const month = new Date(transaction.date).getMonth(); // 0-based index
      if (transaction.type === 'expense') {
        monthlySums[month].expense += transaction.amount;
      } else if (transaction.type === 'income') {
        monthlySums[month].income += transaction.amount;
      }
    });

    return { year, monthlySums };
  });
};

const calculateDailySumsByMonth = (dataAll, uniqueYears) => {
  return uniqueYears.map((year) => {
    // Get all months present in the transactions for this year
    const monthsWithTransactions = Array.from(
      new Set(
        dataAll
          ?.filter((item) => new Date(item.date).getFullYear() === year)
          ?.map((item) => new Date(item.date).getMonth() + 1) // JavaScript months are 0-indexed
      )
    );

    // Calculate daily sums for each month
    const monthlyData = monthsWithTransactions.map((month:any) => {
      // Get the number of days in the month
      const daysInMonth = new Date(year, month, 0).getDate();

      // Initialize daily sums
      const dailySums = Array.from({ length: daysInMonth }, (_, day) => ({
        day: day + 1, // Day index starts at 1
        expense: 0,
        income: 0,
      }));

      // Filter transactions for the specific year and month
      const transactionsForMonth = dataAll.filter((item) => {
        const transactionDate = new Date(item.date);
        return (
          transactionDate.getFullYear() === year &&
          transactionDate.getMonth() + 1 === month
        );
      });

      // Calculate sums for each day
      transactionsForMonth.forEach((transaction) => {
        const day = new Date(transaction.date).getDate() - 1; // Convert to 0-indexed
        if (transaction.type === "expense") {
          dailySums[day].expense += transaction.amount;
        } else if (transaction.type === "income") {
          dailySums[day].income += transaction.amount;
        }
      });

      return { month, dailySums };
    });

    return { year, monthlyData };
  });
};

  console.log(calculateMonthlySums(dataAll,uniqueYears).filter((element)=> element.year === period.year)[0]?.monthlySums);
  
  let dataChart;
  if(timeFrame === "month") {
     dataChart = calculateDailySumsByMonth(dataAll,uniqueYears).filter((el)=> el.year === period.year && el.monthlyData.some((month)=> month.month === (period.month + 1 )));
    if(dataChart?.length > 0)
      dataChart = dataChart[0].monthlyData.filter((el)=> el.month === (period.month + 1))[0].dailySums 
  }
  else { 
    dataChart=calculateMonthlySums(dataAll,uniqueYears).filter((element)=> element.year === period.year)[0]?.monthlySums
  }
  return (
    <div className="container mx-auto px-4 lg:px-0">
      <h2 className="mt-12 text-3xl font-bold">
        History
      </h2>
      <Card className="col-span-12 mt-2 font-bold">
          <CardHeader className="gap-2">  
            <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
              <HistoryPeriodSelector 
                period={period}
                setPeriod={setPeriod}
                timeframe={timeFrame}
                setTimeFrame={setTimeFrame}
              />
              
              <div className="flex h-10 gap-2">
                <Badge variant="outline" className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                  Income
                </Badge>
                <Badge variant="outline" className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 rounded-full bg-red-500"></div>
                  Expense
                </Badge>
              </div>
            </CardTitle>
          </CardHeader> 
          <CardContent>
              <SkeletonWrapper isLoading={isLoadingAll}>
                {
                  dataChart.length > 0 && (
                    <ResponsiveContainer width={"100%"} height={300}>
                      <BarChart height={300} data={dataChart} barCategoryGap={5}>
                        <defs>
                          <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={"0"} stopColor="#10b981" stopOpacity={"1"} />  
                            <stop offset={"1"} stopColor="#10b981" stopOpacity={"0"} />  
                          </linearGradient> 
                          <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={"0"} stopColor="#ef4444" stopOpacity={"1"} />  
                            <stop offset={"1"} stopColor="#ef4444" stopOpacity={"0"} />  
                          </linearGradient> 
                        </defs> 
                        <CartesianGrid strokeDasharray="5 5" strokeOpacity={0.2} vertical={false} />
                        <XAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} padding={{left: 5, right: 5}}
                          dataKey={(data)=> {
                            const {day,month} = data;
                            const date = new Date(period.year,month - 1 || period.month,day  || 1);
                            if(timeFrame === "month")
                              return date.toLocaleDateString("default",{
                                day: "2-digit"
                              })
                            else
                            return date.toLocaleDateString("default",{
                              month: "long"
                            })

                          }
                          }
                        /> 

                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                        <Bar dataKey={"income"} label="Income" fill="url(#incomeBar)" radius={4} className="cursor-pointer" />
                        <Bar dataKey={"expense"} label="Expense" fill="url(#expenseBar)" radius={4} className="cursor-pointer" />
                        <Tooltip cursor={{opacity:0.1}} content={props => (
                          <CustomTooltip formatter={formatter} {...props}/>
                          )}/>
                      </BarChart>
                    </ResponsiveContainer>
                  )
                }

                { 
                  dataChart.length === 0 && <div className="flex h-[300px] flex-col items-center justify-center bg-background">No Data For Select Period</div>
                }
              </SkeletonWrapper>
          </CardContent>
      </Card>
    </div>
  )
}

function CustomTooltip({active,payload,formatter}:any) {
  const {expense,income} = payload.length > 0 ? payload[0].payload : {expense:0, income:0}
  
  
  if(!active || !payload || payload.length === 0) return null
  
  return (
    <div className="min-w-[300px] rounded border bg-background p-4">
         <TooltipRow formatter={formatter} label={"Expense"} value={expense} bgColor={"bg-red-500"} textColors="text-red-500"/>
         <TooltipRow formatter={formatter} label={"Income"} value={income} bgColor={"bg-emerald-500"} textColors="text-emerald-500"/>
         <TooltipRow formatter={formatter} label={"Balance"} value={income - expense} bgColor={"bg-grey-100"} textColors="text-foreground"/>
    </div>
  )
}

function TooltipRow({formatter ,label, value,bgColor,textColors}) {
  const formattingFn = useCallback((value)=> {
    return formatter.format(value)
  },[])
  return(
    <div className="flex items-center gap-2">
      <div className={cn("h-4 w-4 rounded-full",bgColor)}>
        </div>
          <div className="flex w-full justify-between">
            <p className="text-sm text-muted-foreground">
              {label}
            </p>
            <div className={cn("text-sm font-bold",textColors)}>
              <CountUp
                duration={0.5}
                preserveValue
                end={value}
                decimal={"0"}
                formattingFn={formattingFn}
                className="text-sm"
              />
            </div>
          </div>
    </div>
  )
}

function HistoryPeriodSelector({period,setPeriod,timeframe,setTimeFrame}:

  {period: Period;setPeriod: (period:Period)=> void ;timeframe: TimeFrame ;setTimeFrame: (timeframe:TimeFrame)=> void}
) {

  const { uniqueYears,isLoadingAll } = useContext(UserTransactions);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SkeletonWrapper isLoading={isLoadingAll} fullWidth={false}>
        <Tabs value={timeframe} onValueChange={(value)=> {setTimeFrame(value as TimeFrame)}}>
          <TabsList>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </SkeletonWrapper>
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonWrapper isLoading={isLoadingAll}>
          <YearSelector 
            period={period}
            setPeriod={setPeriod}
            years={uniqueYears}
          />
        </SkeletonWrapper>
        {
          timeframe === "month" && (
            <SkeletonWrapper isLoading={isLoadingAll} fullWidth={false}>
              <MonthSelector period={period} setPeriod={setPeriod}/>
            </SkeletonWrapper>
          )
        }
      </div>
    </div>
  )

}

function YearSelector({ period, setPeriod, years }) {
  return (
    <>
      <Select 
        value={period?.year?.toString()} // Fixed to "year" to match your data
        onValueChange={(value) => {
          setPeriod({
            month: period.month,
            year: parseInt(value),
          });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}


function MonthSelector({ period, setPeriod }) {
  return (
    <>
      <Select 
        value={period?.month?.toString()} // Fixed to "year" to match your data
        onValueChange={(value) => {
          setPeriod({
            month: parseInt(value),
            year: period.year,
          });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[0,1,2,3,4,5,6,7,9,10,11].map((month) => {
              const monthStr = new Date(period.year,month,1).toLocaleString("default",{month:"long"})
            return (
            <SelectItem key={month} value={month.toString()}>
              {monthStr}
            </SelectItem>
          )})}
        </SelectContent>
      </Select>
    </>
  );
}
