// components/Trainer/home/MyTemplates.jsx
import React, { useState, useEffect, useRef } from "react";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTemplateStore } from "../../../store/TemplateStore"; // Adjust path as needed
import OverviewTemplateCard from "./OverviewTemplateCard"; // Adjust relative path as needed

const MyTemplates = ({ onViewTemplate }) => {
  const [activeTemplateTab, setActiveTemplateTab] = useState("workout");
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);

  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  const { workoutTemplates, dietTemplates, isLoadingWorkout, isLoadingDiet } =
    useTemplateStore();

  // Define templates early to avoid initialization errors
  const templates =
    activeTemplateTab === "workout" ? workoutTemplates : dietTemplates;
  const isLoadingTemplates =
    activeTemplateTab === "workout" ? isLoadingWorkout : isLoadingDiet;

  // Translation for tabs
  const tabTranslations = {
    workout: "Дасгал",
    diet: "Хооллолт",
  };

  // Reset slider index when templates change
  useEffect(() => {
    setCurrentTemplateIndex(0);
  }, [workoutTemplates, dietTemplates]);

  // Compute translateX based on container width
  const cardsPerView = 3;
  const gapSize = 16; // px for gap-4
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const updateTranslate = () => {
      if (!containerRef.current || templates.length <= cardsPerView) {
        setTranslateX(0);
        return;
      }
      const containerWidth = containerRef.current.offsetWidth;
      const totalGap = (cardsPerView - 1) * gapSize;
      const cardWidth = (containerWidth - totalGap) / cardsPerView;
      const step = cardWidth + gapSize;
      setTranslateX(-currentTemplateIndex * step);
    };

    updateTranslate();
    window.addEventListener("resize", updateTranslate);
    return () => window.removeEventListener("resize", updateTranslate);
  }, [currentTemplateIndex, templates, gapSize, cardsPerView]);

  const maxIndex = Math.max(0, templates.length - cardsPerView);

  const handleNextTemplate = () => {
    setCurrentTemplateIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrevTemplate = () => {
    setCurrentTemplateIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToIndex = (index) => {
    setCurrentTemplateIndex(index);
  };

  const handleView = (templateType, templateData) => {
    onViewTemplate(activeTemplateTab, templateData);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="text-indigo-600" /> Миний загварууд
          </h2>
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
          {["workout", "diet"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTemplateTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                activeTemplateTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              {tabTranslations[tab]}
            </button>
          ))}
        </div>
      </div>

      {isLoadingTemplates ? (
        <div className="text-center text-gray-500 py-12 animate-pulse">
          <FileText className="mx-auto mb-3 opacity-60" size={32} />
          <p className="text-sm">Загваруудыг ачаалж байна...</p>
        </div>
      ) : templates.length > 0 ? (
        <>
          {/* Slider Container */}
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg"
          >
            <motion.div
              ref={sliderRef}
              className="flex gap-4"
              animate={{ x: translateX }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {templates.map((t) => (
                <div
                  key={t._id}
                  className="flex-shrink-0 w-[calc((100%-32px)/3)]"
                >
                  <OverviewTemplateCard
                    t={t}
                    type={activeTemplateTab}
                    onView={handleView}
                  />
                </div>
              ))}
            </motion.div>

            {/* Navigation Buttons */}
            {currentTemplateIndex > 0 && (
              <button
                onClick={handlePrevTemplate}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full p-2 transition-all z-10 border border-gray-200"
                aria-label="Өмнөх загварууд"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
            )}
            {currentTemplateIndex < maxIndex && (
              <button
                onClick={handleNextTemplate}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full p-2 transition-all z-10 border border-gray-200"
                aria-label="Дараагийн загварууд"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* Indicator (optional) */}
          {templates.length > cardsPerView && (
            <div className="flex justify-center mt-4 gap-1">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentTemplateIndex === i ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <FileText className="mx-auto mb-3 opacity-60" size={32} />
          <p className="text-sm font-medium">Одоогоор загвар байхгүй.</p>
          <p className="text-xs mt-1">Загваруудын хэсэгт шинээр үүсгэ!</p>
        </div>
      )}
    </section>
  );
};

export default MyTemplates;
