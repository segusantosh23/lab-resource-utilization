import { useContext, useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";
import { getAllEquipment } from "../../services/equipmentService";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import BookingHeatmap from '../../components/BookingHeatmap';

const ResearcherDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bookingsData, equipmentData] = await Promise.all([
                getMyBookings(),
                getAllEquipment()
            ]);
            setBookings(bookingsData);
            setEquipment(equipmentData);
        } catch (error) {
            console.error("Failed to fetch researcher data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const dashboardCards = [

        {
            title: "Upcoming Bookings",
            count: bookings.filter(
                b => b.status === "CONFIRMED"
            ).length,
            description: "Scheduled future bookings",
            path: "/researcher/bookings/upcoming",
            color: "indigo",
        },

        {
            title: "Active Bookings",
            count: bookings.filter(
                b => b.status === "IN_USE"
            ).length,
            description: "Equipment currently in use",
            path: "/researcher/bookings/active",
            color: "emerald",
        },
        {
            title: "Waitlist Bookings",
            count: bookings.filter(
                b => b.status === "PENDING_APPROVAL"
            ).length,
            description: "Pending booking requests",
            path: "/researcher/bookings/waitlist",
            color: "amber",
        },
        {
            title: "Booking History",
            count: bookings.filter(
                b =>
                    b.status === "COMPLETED" ||
                    b.status === "CANCELLED" ||
                    b.status === "REJECTED" ||
                    b.status === "NO_SHOW"
            ).length,
            description: "Completed and closed bookings",
            path: "/researcher/bookings/history",
            color: "purple",
        },
    ];

  // const handleLogout = () => {
  //   logout();
  //   navigate('/');
  // };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center text-white">
                Loading Dashboard...
            </div>
        );
    }

    const hour = new Date().getHours();

    const greeting =
        hour < 12
            ? "Good Morning"
            : hour < 17
                ? "Good Afternoon"
                : "Good Evening";


    const availableEquipment = equipment.filter(
        item => item.status === "AVAILABLE"
    ).length;

    const bookedEquipment = equipment.filter(
        item => item.status === "BOOKED"
    ).length;

    const maintenanceEquipment = equipment.filter(
        item => item.status === "UNDER_MAINTENANCE"
    ).length;

    const totalEquipment = equipment.length;
    const recommendedEquipment = equipment
        .filter(item => item.status === "AVAILABLE")
        .slice(0, 3);
  return (
    <div className="min-h-screen bg-[#0d0e12] text-white font-sans pb-16 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 mt-8 relative z-10 animate-fadeIn">
          <div className="mb-8">

              <h1 className="text-4xl font-bold tracking-tight">

                  {greeting},

                  <span className="text-purple-400">
            {" "}{user?.name}
        </span>

                  👋

              </h1>

              <p className="text-gray-400 mt-2">

                  Welcome to your Researcher Dashboard.
                  Here's an overview of your bookings and laboratory activities.

              </p>

          </div>
          <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 flex-1 flex flex-col justify-center">
                  <p className="text-gray-400">
                      Total Bookings
                  </p>
                  <h2 className="text-4xl font-bold mt-2">
                      {bookings.length}
                  </h2>
              </div>
              <div
                  onClick={() => navigate("/researcher/UsageSummary")}
                  className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 flex-1 shadow-xl hover:border-purple-500/30 hover:-translate-y-1 transition cursor-pointer flex flex-col justify-center"
              >
                  <div className="flex justify-between items-center">
                      <div>
                          <h3 className="text-xl font-semibold">
                              Usage Summary
                          </h3>
                          <p className="text-gray-400 mt-2 text-sm">
                              View your equipment usage statistics and booking trends.
                          </p>
                      </div>
                      <span className="text-purple-400 text-xl">
                          →
                      </span>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

              {dashboardCards.map((card, index) => (

                  <div
                      key={index}
                      onClick={() => navigate(card.path)}
                      className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30 cursor-pointer"
                  >

                      <div
                          className={`p-3 rounded-lg inline-block mb-4 ${
                              card.color === "indigo"
                                  ? "bg-indigo-500/10 text-indigo-400"
                                  : card.color === "emerald"
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : card.color === "amber"
                                          ? "bg-amber-500/10 text-amber-400"
                                          : "bg-purple-500/10 text-purple-400"
                          }`}
                      >

                          {card.color === "indigo" && (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12" />
                              </svg>
                          )}

                          {card.color === "emerald" && (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M5 13l4 4L19 7" />
                              </svg>
                          )}

                          {card.color === "amber" && (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 8v4m0 4h.01" />
                              </svg>
                          )}

                          {card.color === "purple" && (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 8v4l3 3" />
                              </svg>
                          )}

                      </div>

                      <h3 className="text-lg font-semibold">
                          {card.title}
                      </h3>

                      <h1 className="text-4xl font-bold mt-3">
                          {card.count}
                      </h1>

                      <p className="text-gray-400 text-sm mt-3">
                          {card.description}
                      </p>

                      <div className="mt-5 text-purple-400 text-sm font-medium">
                          View Details →
                      </div>

                  </div>

              ))}

          </div>

          {bookings.length === 0 && (

              <div className="mt-8 bg-[#12131a] border border-white/[0.05] rounded-2xl p-8 text-center">

                  <h2 className="text-2xl font-semibold">
                      No Bookings Yet
                  </h2>

                  <p className="text-gray-400 mt-3">
                      You haven't created any booking requests yet.
                  </p>

                  <button
                      onClick={() => navigate("/bookings")}
                      className="mt-6 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
                  >
                      Create First Booking
                  </button>

              </div>

          )}

          {/* Equipment Overview & Usage Summary */}

          {/* Equipment Overview & Heatmap */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 items-stretch">

              {/* Equipment Availability */}

              <div
                  onClick={() => navigate("/researcher/equipment")}
                  className="md:col-span-1 h-full bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl hover:border-purple-500/30 hover:-translate-y-1 transition cursor-pointer flex flex-col justify-between"
              >

                  <div className="flex justify-between items-start">

                      <div>

                          <h3 className="text-xl font-semibold">
                              Equipment Availability
                          </h3>

                          <p className="text-gray-400 mt-2 text-sm">
                              Live laboratory inventory status.
                          </p>

                      </div>

                      <span className="text-purple-400 text-xl">
                →
            </span>

                  </div>

                  <div className="flex-1 flex flex-col justify-center mt-4">
                      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                          <div>
                              <p className="text-gray-500 text-sm lg:text-base">Total</p>
                              <h2 className="text-3xl lg:text-4xl font-bold mt-2">{totalEquipment}</h2>
                          </div>
                          <div>
                              <p className="text-green-400 text-sm lg:text-base">Available</p>
                              <h2 className="text-3xl lg:text-4xl font-bold mt-2">{availableEquipment}</h2>
                          </div>
                          <div>
                              <p className="text-blue-400 text-sm lg:text-base">Booked</p>
                              <h2 className="text-3xl lg:text-4xl font-bold mt-2">{bookedEquipment}</h2>
                          </div>
                          <div>
                              <p className="text-yellow-400 text-sm lg:text-base">Maintenance</p>
                              <h2 className="text-3xl lg:text-4xl font-bold mt-2">{maintenanceEquipment}</h2>
                          </div>
                      </div>
                  </div>

              </div>

              {/* Booking Heatmap */}
              <div className="md:col-span-3 h-full animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                  <BookingHeatmap bookings={bookings} />
              </div>

          </div>

          {/* Recommended Equipment */}

          <div className="mt-10">

              <h2 className="text-2xl font-bold mb-6">

                  Recommended Equipment

              </h2>

              {recommendedEquipment.length === 0 ? (

                  <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-8 text-center">

                      <h3 className="text-xl font-semibold">

                          No Equipment Available

                      </h3>

                      <p className="text-gray-400 mt-3">

                          There are currently no available laboratory resources.

                      </p>

                  </div>

              ) : (

                  <div className="grid md:grid-cols-3 gap-6">

                      {recommendedEquipment.map(item => (

                          <div
                              key={item.id}
                              onClick={() => navigate(`/equipment/${item.id}`)}
                              className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 hover:border-purple-500/30 hover:-translate-y-1 transition cursor-pointer"
                          >

                              <h3 className="font-semibold text-lg">

                                  {item.name}

                              </h3>

                              <p className="text-gray-400 text-sm mt-3">

                                  {item.category}

                              </p>

                              <div className="mt-4 flex justify-between text-sm">

                        <span>

                            Qty: {item.quantity}

                        </span>

                                  <span className="text-green-400">

                            {item.status.replace(/_/g, " ")}

                        </span>

                              </div>

                              <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      navigate("/bookings");
                                  }}
                                  className="mt-5 w-full bg-purple-600 hover:bg-purple-500 rounded-lg py-2 transition"
                              >

                                  Book Now

                              </button>

                          </div>

                      ))}

                  </div>

              )}

          </div>
        

      </main>
    </div>
  );
};

export default ResearcherDashboard;

