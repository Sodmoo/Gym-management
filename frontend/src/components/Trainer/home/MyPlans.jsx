// components/Trainer/home/MyPlans.jsx
import React, { useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SquareChartGantt,
  Clock,
  CheckCircle2,
  CalendarX2,
  ChevronDown,
  ChevronUp,
  User,
  Search as SearchIcon,
  X as ClearIcon,
  Dumbbell,
  ArrowBigRight,
  Utensils,
} from "lucide-react";
import UserDetailModal from "../../../components/Plan/UserDetailModal";

const MyPlansTable = ({
  plans = [],
  currentTrainer,
  toAvatarUrl,
  searchTerm,
  setSearchTerm,
  onView,
  onViewUser,
  onViewAll,
}) => {
  const [sortBy, setSortBy] = useState({ key: "startDate", direction: "asc" });

  const getMember = (plan, trainer) => {
    let memberIdOrObj = plan.memberId;
    let fullMember = null;

    if (typeof memberIdOrObj === "string") {
      fullMember = trainer?.students?.find(
        (s) => String(s._id) === String(memberIdOrObj)
      );
    } else if (memberIdOrObj && typeof memberIdOrObj === "object") {
      fullMember = memberIdOrObj;
    }

    return fullMember || null;
  };

  const getMemberName = useCallback((plan, trainer) => {
    let memberIdOrObj = plan.memberId;
    let member = null;

    if (typeof memberIdOrObj === "string") {
      member = trainer?.students?.find(
        (s) => String(s._id) === String(memberIdOrObj)
      );
    } else if (memberIdOrObj && typeof memberIdOrObj === "object") {
      member = memberIdOrObj;
    }

    if (!member) return "Unassigned";
    return (
      member.username ||
      member.name ||
      member.userId?.username ||
      member._id?.slice(0, 8) ||
      "Unassigned"
    );
  }, []);

  const sortedPlans = useMemo(() => {
    let filtered = [...plans].filter(
      (plan) =>
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getMemberName(plan, currentTrainer)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        plan.goal.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      let aVal = a[sortBy.key];
      let bVal = b[sortBy.key];
      if (sortBy.key === "startDate" || sortBy.key === "endDate") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortBy.key === "memberName") {
        aVal = getMemberName(a, currentTrainer);
        bVal = getMemberName(b, currentTrainer);
      } else if (sortBy.key === "status") {
        const statusOrder = { active: 1, pending: 2, completed: 3 };
        aVal = statusOrder[a.status] || 4;
        bVal = statusOrder[b.status] || 4;
      }
      if (aVal < bVal) return sortBy.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortBy.direction === "asc" ? 1 : -1;
      return 0;
    });
    return filtered.slice(0, 5);
  }, [plans, sortBy, currentTrainer, searchTerm, getMemberName]);

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        class:
          "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300",
        icon: CheckCircle2,
      },
      pending: {
        class:
          "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300",
        icon: Clock,
      },
      completed: {
        class:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300",
        icon: CheckCircle2,
      },
    };
    const { class: bgClass, icon: Icon } = badges[status] || badges.pending;
    return (
      <motion.span
        whileHover={{ scale: 1.05 }}
        className={`inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-semibold ${bgClass} shadow-md border backdrop-blur-sm`}
      >
        <Icon size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </motion.span>
    );
  };

  const toggleSort = (key) => {
    setSortBy((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const content =
    sortedPlans.length > 0 ? (
      <>
        <div className="overflow-hidden rounded-sm border-1 border-cyan-50 bg-gray-100">
          <table className="min-w-full divide-y divide-gray-500">
            <thead className="bg-cyan-400">
              <tr>
                {[
                  { key: "title", label: "Plan Title", sortable: true },
                  { key: "memberName", label: "Member", sortable: true },
                  { key: "startDate", label: "Started", sortable: true },
                  { key: "endDate", label: "Ended", sortable: true },
                  { key: "workouts", label: "Workouts" },
                  { key: "diet", label: "Diet" },
                  { key: "status", label: "Status", sortable: true },
                ].map(({ key, label, sortable }) => (
                  <th
                    key={key}
                    className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-cyan-300 transition-all duration-200"
                    onClick={sortable ? () => toggleSort(key) : undefined}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {label}
                      {sortable && (
                        <motion.span
                          className="transition-transform duration-200"
                          animate={{
                            rotate:
                              sortBy.key === key
                                ? sortBy.direction === "asc"
                                  ? 0
                                  : 180
                                : 180,
                          }}
                        >
                          <ChevronDown
                            size={15}
                            className={
                              sortBy.key === key ? "text-white" : "text-black"
                            }
                          />
                        </motion.span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              <AnimatePresence>
                {sortedPlans.map((plan, idx) => {
                  const member = getMember(plan, currentTrainer);
                  const avatarRaw =
                    member?.profileImage ||
                    member?.avatar ||
                    member?.userId?.profileImage ||
                    null;
                  const avatarUrl = avatarRaw
                    ? toAvatarUrl(avatarRaw)
                    : "/default-avatar.png";

                  const memberId =
                    typeof plan.memberId === "object"
                      ? plan.memberId?._id
                      : plan.memberId;
                  const memberDetails = currentTrainer?.students?.find(
                    (s) => String(s._id) === String(memberId)
                  );
                  let memberUserObj = null;
                  if (memberDetails) {
                    memberUserObj = {
                      _id: memberDetails._id,
                      surname: memberDetails.surname,
                      username: memberDetails.username,
                      email: memberDetails.email,
                      phone: memberDetails.phone,
                      age: memberDetails.age,
                      height: memberDetails.height,
                      weight: memberDetails.weight,
                      gender: memberDetails.gender,
                      address: memberDetails.address,
                      goal: memberDetails.goal,
                      profileImage: memberDetails.profileImage,
                      membership: memberDetails.membership,
                      subGoals: memberDetails.subGoals,
                    };
                  } else if (
                    plan.memberId &&
                    typeof plan.memberId === "object"
                  ) {
                    memberUserObj = {
                      _id: plan.memberId._id,
                      surname:
                        plan.memberId.surname || plan.memberId.userId?.surname,
                      username:
                        plan.memberId.username ||
                        plan.memberId.userId?.username,
                      email: plan.memberId.email || plan.memberId.userId?.email,
                      phone: plan.memberId.phone || plan.memberId.userId?.phone,
                      age: plan.memberId.age || plan.memberId.userId?.age,
                      height:
                        plan.memberId.height || plan.memberId.userId?.height,
                      weight:
                        plan.memberId.weight || plan.memberId.userId?.weight,
                      gender:
                        plan.memberId.gender || plan.memberId.userId?.gender,
                      address:
                        plan.memberId.address || plan.memberId.userId?.address,
                      goal: plan.memberId.goal || plan.memberId.userId?.goal,
                      profileImage:
                        plan.memberId.profileImage ||
                        plan.memberId.userId?.profileImage,
                      membership: plan.memberId.membership,
                      subGoals: plan.memberId.subGoals,
                    };
                  }

                  return (
                    <motion.tr
                      key={plan._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="hover:bg-cyan-100 transition-all duration-300 border-b border-gray-100/50"
                    >
                      <td className="px-6 py-4 text-center">
                        <div className="truncate max-w-32 font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                          {plan.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <motion.div
                            className="relative w-8 h-8 rounded-full overflow-hidden shadow-md ring-1 ring-gray-200/50"
                            whileHover={{ scale: 1.1 }}
                          >
                            <img
                              src={avatarUrl}
                              alt={getMemberName(plan, currentTrainer)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentNode.querySelector(
                                  ".placeholder-icon"
                                ).style.display = "flex";
                              }}
                            />
                            <div
                              className={`absolute inset-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${
                                avatarRaw ? "hidden placeholder-icon" : ""
                              }`}
                            >
                              <User size={12} className="text-gray-500" />
                            </div>
                          </motion.div>
                          <span
                            className={`truncate max-w-20 font-medium transition-colors ${
                              memberUserObj
                                ? "cursor-pointer hover:text-blue-600"
                                : ""
                            }`}
                            onClick={
                              memberUserObj
                                ? (e) => {
                                    e.stopPropagation();
                                    onViewUser(memberUserObj);
                                  }
                                : undefined
                            }
                          >
                            {getMemberName(plan, currentTrainer)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        <div className="text-xs font-mono">
                          {new Date(plan.startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        <div className="text-xs font-mono">
                          {new Date(plan.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-center text-sm text-gray-600 font-mono cursor-pointer hover:bg-blue-200 transition-all duration-200 rounded-md"
                        onClick={() => onView("workout", plan.workoutTemplate)}
                      >
                        <div className="text-sm flex justify-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold">
                          <Dumbbell size={20} />
                          {plan.workoutTemplate?.program?.length || 0}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-center text-sm text-gray-600 font-mono cursor-pointer hover:bg-green-200 transition-all duration-200 rounded-md"
                        onClick={() => onView("diet", plan.dietTemplate)}
                      >
                        <div className="text-sm flex justify-center gap-2 text-teal-600 hover:text-teal-700 font-semibold">
                          <Utensils size={20} />
                          {plan.dietTemplate?.dailyMeals?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(plan.status)}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {plans.length > 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <button
              onClick={onViewAll}
              className="text-cyan-600 p-2 hover:bg-blue-600 rounded-lg hover:text-white text-md font-semibold transition-all duration-200 flex items-center gap-1 mx-auto group cursor-pointer"
            >
              Go to Plans
              <ArrowBigRight
                size={16}
                className="group-hover:ml-1 transition-all"
              />
            </button>
          </motion.div>
        )}
      </>
    ) : (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 text-gray-400 bg-gradient-to-br from-gray-50/50 to-white/50 rounded-xl border border-gray-200/50"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-4 opacity-40"
        >
          <CalendarX2 size={48} />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">No Plans Found</h2>
        <p className="text-sm mb-6">
          {searchTerm
            ? "Try adjusting your search."
            : "Create plans to manage your clients here."}
        </p>
        {searchTerm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchTerm("")}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm font-semibold transition-all duration-200 mx-auto bg-cyan-50/50 px-4 py-2 rounded-lg border border-cyan-200/50"
          >
            <ClearIcon size={16} /> Reset Search
          </motion.button>
        )}
      </motion.div>
    );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="relative flex items-center bg-cyan-50 backdrop-blur-sm rounded-md border border-gray-200/50 shadow-sm p-3">
          <SearchIcon size={20} className="text-gray-700 absolute left-4" />
          <input
            type="text"
            placeholder="Search plans, members, or goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 bg-transparent outline-none text-sm placeholder-gray-500 font-medium"
          />
          {searchTerm && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchTerm("")}
              className="absolute right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/50 transition-all duration-200"
              title="Clear search"
            >
              <ClearIcon size={18} />
            </motion.button>
          )}
        </div>
      </motion.div>
      {content}
    </div>
  );
};

const MyPlans = ({
  plans = [],
  currentTrainer,
  toAvatarUrl,
  onViewTemplate,
  onViewAllPlans,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleViewUser = (userData) => {
    if (!userData) return;
    setSelectedUser(userData);
    setIsUserDetailOpen(true);
  };

  const handleCloseUserDetail = () => {
    setIsUserDetailOpen(false);
    setSelectedUser(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-8 space-y-3 bg-white/70 backdrop-blur-sm p-6 rounded-lg border-1 border-blue-600 shadow-lg"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <SquareChartGantt size={28} className="text-cyan-600" />
          </motion.div>
          <h2 className="text-2xl text-gray-900 bg-clip-text">My Plans</h2>
        </div>
      </motion.div>
      <MyPlansTable
        plans={plans}
        currentTrainer={currentTrainer}
        toAvatarUrl={toAvatarUrl}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onView={onViewTemplate} // Pass onViewTemplate directly
        onViewUser={handleViewUser}
        onViewAll={onViewAllPlans}
      />
      <AnimatePresence>
        {isUserDetailOpen && selectedUser && (
          <UserDetailModal
            isOpen={isUserDetailOpen}
            onClose={handleCloseUserDetail}
            user={selectedUser}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyPlans;
