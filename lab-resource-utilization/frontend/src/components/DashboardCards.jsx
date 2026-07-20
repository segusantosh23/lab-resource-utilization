import React from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaTimesCircle,
} from "react-icons/fa";

const DashboardCards = ({
  total,
  active,
  dueSoon,
  expired,
  failed,
}) => {
  const cards = [
    {
      title: "Total",
      value: total,
      icon: <FaClipboardList size={26} />,
      color: "from-indigo-600 to-blue-600",
    },
    {
      title: "Active",
      value: active,
      icon: <FaCheckCircle size={26} />,
      color: "from-green-600 to-green-500",
    },
    {
      title: "Due Soon",
      value: dueSoon,
      icon: <FaExclamationTriangle size={26} />,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Expired",
      value: expired,
      icon: <FaCalendarTimes size={26} />,
      color: "from-red-600 to-red-500",
    },
    {
      title: "Failed",
      value: failed,
      icon: <FaTimesCircle size={26} />,
      color: "from-gray-700 to-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${card.color} rounded-xl p-6 shadow-lg`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/80 text-sm">
                {card.title}
              </p>

              <h2 className="text-3xl font-bold text-white mt-2">
                {card.value}
              </h2>
            </div>

            <div className="text-white">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;