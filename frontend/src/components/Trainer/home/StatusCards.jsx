import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, ClipboardList, FileText, Calendar } from "lucide-react";

/* ---------------- Counter Animation ---------------- */
const Counter = ({ end, duration = 800 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

/* ---------------- Main Component ---------------- */
const StatusCards = ({
  totalStudents = 0,
  activePlansCount = 0,
  totalTemplates = 0,
  todaySchedulesCount = 0,
}) => {
  const cards = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      gradient: "from-blue-400 via-cyan-300 to-blue-500",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-400",
    },
    {
      title: "Active Plans",
      value: activePlansCount,
      icon: ClipboardList,
      gradient: "from-green-400 via-emerald-300 to-green-500",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-400",
    },
    {
      title: "Workout Templates",
      value: totalTemplates,
      icon: FileText,
      gradient: "from-orange-400 via-amber-300 to-orange-500",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-400",
    },
    {
      title: "Today's Sessions",
      value: todaySchedulesCount,
      icon: Calendar,
      gradient: "from-purple-400 via-pink-300 to-purple-500",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-400",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-sans text-gray-800"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative group rounded-sm p-[2px] transition-all duration-300"
          >
            {/* 🔥 Chasing color border with glow */}
            <div
              className={`absolute inset-0 rounded-sm bg-gradient-to-r ${card.gradient} 
              opacity-40 group-hover:opacity-80 group-hover:animate-chasing-glow`}
            ></div>

            {/* Inner card */}
            <div className="relative z-5 bg-white rounded-sm p-5 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`flex h-15 w-15 items-center justify-center rounded-lg text-white shadow-sm ${card.iconBg}`}
                >
                  <Icon className="h-9 w-9" />
                </div>
                <h2 className="text-5xl font-bold">
                  <Counter end={card.value} />
                </h2>
              </div>
              <p className="text-md font-medium text-gray-600">{card.title}</p>
              <div
                className={`mt-2 h-[3px] w-45 rounded-full bg-gradient-to-r ${card.gradient}`}
              ></div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StatusCards;
