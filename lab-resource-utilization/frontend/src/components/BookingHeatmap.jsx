import React, { useMemo, useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BookingHeatmap = ({ bookings }) => {
  const [timeFilter, setTimeFilter] = useState('Monthly');

  const heatmapData = useMemo(() => {
    const blocks = [];
    let maxCount = 0;

    const countsByDate = {};
    const countsByDayHour = {};

    // Precompute booking counts
    bookings.forEach(booking => {
      if (!booking.startTime) return;
      const start = new Date(booking.startTime);
      const dateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      
      countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
      
      const dayHourKey = `${start.getDay()}-${start.getHours()}`;
      countsByDayHour[dayHourKey] = (countsByDayHour[dayHourKey] || 0) + 1;
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (timeFilter === 'Daily') {
      const grid = Array(24).fill(null).map((_, hour) => {
        return Array(7).fill(null).map((_, dayOfWeek) => {
          const count = countsByDayHour[`${dayOfWeek}-${hour}`] || 0;
          if (count > maxCount) maxCount = count;
          return { dayOfWeek, hour, count };
        });
      });
      blocks.push({ label: 'Hours', grid });
    } 
    else if (timeFilter === 'Weekly') {
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
      const numWeeks = Math.ceil((daysInMonth + firstDayOfWeek) / 7);
      
      let currentDay = 1;
      for (let week = 0; week < numWeeks; week++) {
        const weekCol = [];
        for (let row = 0; row < 7; row++) {
          if (week === 0 && row < firstDayOfWeek) {
            weekCol.push(null);
          } else if (currentDay > daysInMonth) {
            weekCol.push(null);
          } else {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
            const count = countsByDate[dateStr] || 0;
            if (count > maxCount) maxCount = count;
            weekCol.push({ day: currentDay, dateStr, count });
            currentDay++;
          }
        }
        blocks.push({ label: `Week ${week + 1}`, grid: [weekCol] });
      }
    } 
    else if (timeFilter === 'Monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(currentYear, month, 1).getDay(); 
        
        const numCols = Math.ceil((daysInMonth + firstDayOfWeek) / 7);
        const monthGrid = Array(numCols).fill(null).map(() => Array(7).fill(null));
        
        let currentDay = 1;
        for (let col = 0; col < numCols; col++) {
          for (let row = 0; row < 7; row++) {
            if (col === 0 && row < firstDayOfWeek) {
              monthGrid[col][row] = null; 
            } else if (currentDay > daysInMonth) {
              monthGrid[col][row] = null;
            } else {
              const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
              const count = countsByDate[dateStr] || 0;
              if (count > maxCount) maxCount = count;
              monthGrid[col][row] = { day: currentDay, dateStr, count };
              currentDay++;
            }
          }
        }
        blocks.push({ label: months[month], grid: monthGrid });
      }
    }

    return { blocks, maxCount };
  }, [bookings, timeFilter]);

  const { blocks, maxCount } = heatmapData;

  const getColor = (count) => {
    if (count === 0) return 'bg-[#1a1b26]'; // Empty state, dark background
    const intensity = Math.ceil((count / (maxCount || 1)) * 4);
    switch(intensity) {
      case 1: return 'bg-purple-900/50';
      case 2: return 'bg-purple-700/70';
      case 3: return 'bg-purple-500/90';
      case 4: return 'bg-purple-400';
      default: return 'bg-purple-400';
    }
  };

  const getCellSizeClass = () => {
    // Daily/Weekly keep their larger height as requested previously
    const h = 'h-[10px] md:h-[12px] lg:h-[13px] xl:h-[14px]';
    if (timeFilter === 'Daily') return `w-3 sm:w-4 md:w-5 lg:w-6 ${h} rounded-[2px]`;
    if (timeFilter === 'Weekly') return `w-4 sm:w-6 md:w-8 lg:w-10 ${h} rounded-[2px]`;
    
    // For Monthly: perfectly square, scaled down significantly for all screen sizes to guarantee fit
    return 'w-[6px] h-[6px] sm:w-[7px] sm:h-[7px] md:w-[8px] md:h-[8px] lg:w-[10px] lg:h-[10px] xl:w-[11px] xl:h-[11px] rounded-[1px]';
  };

  const getRowGapClass = () => {
    return 'gap-[2px]';
  };

  const renderCell = (cell, rowIndex) => {
    const sizeClass = getCellSizeClass();
    if (!cell) {
      return <div key={rowIndex} className={`${sizeClass} invisible`}></div>;
    }
    
    let title = '';
    if (timeFilter === 'Daily') {
      const hour = cell.hour;
      title = `${DAYS[cell.dayOfWeek]} at ${hour}:00 - ${cell.count} booking${cell.count !== 1 ? 's' : ''}`;
    } else {
      title = `${cell.dateStr}: ${cell.count} booking${cell.count !== 1 ? 's' : ''}`;
    }

    return (
      <div 
        key={rowIndex} 
        title={title}
        className={`${sizeClass} ${getColor(cell.count)} transition-all duration-200 hover:ring-2 hover:ring-white/80 cursor-pointer relative hover:z-10`}
      ></div>
    );
  };

  const getBlockGapClass = () => {
    if (timeFilter === 'Daily') return 'gap-0'; // only 1 block
    if (timeFilter === 'Weekly') return 'gap-4 md:gap-8 lg:gap-12';
    // Very tight gaps for Monthly to ensure Dec fits
    return 'gap-[2px] md:gap-[4px] xl:gap-1.5';
  };

  const getColGapClass = () => {
    if (timeFilter === 'Daily') return 'gap-[2px] sm:gap-1 md:gap-1.5 lg:gap-2';
    if (timeFilter === 'Weekly') return 'gap-1 md:gap-2 lg:gap-3';
    // Tighter internal gaps for Monthly
    return 'gap-[1px] md:gap-[2px]';
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl hover:border-purple-500/30 transition-all duration-300">
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-xl font-semibold">Booking Activity Heatmap</h3>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="bg-[#181922] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white transition cursor-pointer"
        >
          <option value="Daily">Daily (Hours)</option>
          <option value="Weekly">Weekly (Weeks)</option>
          <option value="Monthly">Monthly (Months)</option>
        </select>
      </div>
      
      <div className="flex-1 flex flex-col justify-center mt-1 w-full">
        <div className="flex items-start justify-center w-full">
          
          {/* Y-Axis Labels */}
          {(timeFilter === 'Daily' || timeFilter === 'Weekly') && (
            <div className="flex flex-col gap-[2px] mr-3 shrink-0">
              {DAYS.map(day => (
                <div key={day} className="h-[10px] md:h-[12px] lg:h-[13px] xl:h-[14px] flex items-center justify-end text-[11px] md:text-xs font-medium text-gray-300 leading-none">
                  {day}
                </div>
              ))}
            </div>
          )}

          {/* Grid Area - No Scrollbar, Responsive Gaps */}
          <div key={timeFilter} className={`flex ${getBlockGapClass()} overflow-visible px-1 pb-2`}>
            {blocks.map((block, blockIndex) => (
              <div key={blockIndex} className="flex flex-col">
                <div className={`flex ${getColGapClass()}`}>
                  {block.grid.map((col, colIndex) => (
                    <div key={colIndex} className={`flex flex-col ${getRowGapClass()} items-center`}>
                      {col.map((cell, rowIndex) => renderCell(cell, rowIndex))}
                      
                      {/* X-Axis Label for Daily (Hours) */}
                      {timeFilter === 'Daily' && (
                        <div className="text-[9px] sm:text-[10px] text-gray-500 mt-1 h-3 flex items-center justify-center">
                          {colIndex % 2 === 0 ? (colIndex === 0 ? '12AM' : colIndex < 12 ? `${colIndex}AM` : colIndex === 12 ? '12PM' : `${colIndex-12}PM`) : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* X-Axis Label for Weekly / Monthly */}
                {timeFilter !== 'Daily' && (
                  <div className="text-[10px] sm:text-[11px] text-gray-400 mt-2 text-center w-full">
                    {block.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex items-center justify-end gap-3 text-xs text-gray-400">
        <span className="font-medium">Less</span>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-[2px] bg-[#1a1b26]"></div>
          <div className="w-3 h-3 rounded-[2px] bg-purple-900/50"></div>
          <div className="w-3 h-3 rounded-[2px] bg-purple-700/70"></div>
          <div className="w-3 h-3 rounded-[2px] bg-purple-500/90"></div>
          <div className="w-3 h-3 rounded-[2px] bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.4)]"></div>
        </div>
        <span className="font-medium">More</span>
      </div>
    </div>
  );
};

export default BookingHeatmap;
