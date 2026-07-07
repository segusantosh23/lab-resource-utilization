import React, { useMemo } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const BookingHeatmap = ({ bookings }) => {
  const heatmapData = useMemo(() => {
    // Initialize 7x24 grid with 0
    const grid = Array(7).fill(null).map(() => Array(24).fill(0));
    let maxCount = 0;

    bookings.forEach(booking => {
      if (!booking.startTime || !booking.endTime) return;
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      
      if (start.getDate() === end.getDate()) {
        const day = start.getDay(); // 0 (Sun) to 6 (Sat)
        for (let h = start.getHours(); h <= end.getHours(); h++) {
          grid[day][h]++;
          if (grid[day][h] > maxCount) maxCount = grid[day][h];
        }
      } else {
        const day = start.getDay();
        const h = start.getHours();
        grid[day][h]++;
        if (grid[day][h] > maxCount) maxCount = grid[day][h];
      }
    });

    return { grid, maxCount };
  }, [bookings]);

  const { grid, maxCount } = heatmapData;

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

  return (
    <div className="w-full h-full flex flex-col bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl hover:border-purple-500/30 transition-all duration-300">
      <div className="mb-2">
        <h3 className="text-xl font-semibold">Booking Activity Heatmap</h3>
        <p className="text-gray-400 text-sm mt-1">Resource utilization by day and hour</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center mt-0 w-full">
        <div className="w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 shrink-0"></div>
            <div className="flex flex-1 gap-1 text-[10px] text-gray-500 pb-2 uppercase tracking-wider">
              {HOURS.map(hour => (
                <div key={hour} className="flex-1 text-center">
                  {hour % 2 === 0 ? (hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour-12}p`) : ''}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-1 w-full mt-1">
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-2 w-full">
                <div className="w-8 text-[11px] font-medium text-gray-400 text-right shrink-0">{day}</div>
                <div className="flex flex-1 gap-1 w-full">
                  {HOURS.map(hour => {
                    const count = grid[dayIndex][hour];
                    return (
                      <div
                        key={hour}
                        title={`${day} at ${hour}:00 - ${count} booking${count !== 1 ? 's' : ''}`}
                        className={`flex-1 aspect-square rounded-[3px] ${getColor(count)} transition-all duration-300 hover:ring-2 hover:ring-white/80 cursor-pointer hover:scale-110`}
                      ></div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-3 text-xs text-gray-400">
        <span className="font-medium">Less</span>
        <div className="flex gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-[#1a1b26]"></div>
          <div className="w-3.5 h-3.5 rounded-sm bg-purple-900/50"></div>
          <div className="w-3.5 h-3.5 rounded-sm bg-purple-700/70"></div>
          <div className="w-3.5 h-3.5 rounded-sm bg-purple-500/90"></div>
          <div className="w-3.5 h-3.5 rounded-sm bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.4)]"></div>
        </div>
        <span className="font-medium">More</span>
      </div>
    </div>
  );
};

export default BookingHeatmap;
