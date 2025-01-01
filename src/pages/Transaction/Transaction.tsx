import { DateRangePicker } from '@/components/ui/date-range-picker';
import { differenceInDays, startOfMonth } from 'date-fns';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import React, { useState } from 'react';
import TransactionTable from './_components/TransactionTable';

const Transaction = () => {
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });

    const [sortConfig, setSortConfig] = useState({
        column: 'id', // Default sort column
        direction: 'asc' as 'asc' | 'desc', // Default sort direction
    });

    const handleSort = (column: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.column === column && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ column, direction });
    };

    return (
        <>
            <div className="border-b bg-card">
                <div className="container flex flex-wrap items-center md:justify-between justify-center gap-6 py-8 mx-auto px-4 lg:px-0 ">
                    <div className="">
                        <p className="text-3xl font-bold">Transaction History</p>
                    </div>
                    <DateRangePicker
                        initialDateFrom={dateRange.from}
                        initialDateTo={dateRange.to}
                        showCompare={false}
                        onUpdate={(values) => {
                            const { from, to } = values.range;
                            if (!from || !to) return;
                            if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                                alert(`Please select a date range that is not more than ${MAX_DATE_RANGE_DAYS} days`);
                                return;
                            }
                            setDateRange({ from, to });
                        }}
                    ></DateRangePicker>
                </div>
            </div>

            {/* Center the table in the middle of the screen */}
            <div className="flex container justify-center items-center mt-20 mx-auto px-4 lg:px-0" >
                <div className="w-full">
                    <TransactionTable
                        from={dateRange.from}
                        to={dateRange.to}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                    />
                </div>
            </div>
        </>
    );
};

export default Transaction;
