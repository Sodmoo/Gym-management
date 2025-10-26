// TemplateManager.jsx (updated to import and use the split components)
import React, { useState, useEffect } from "react";
import TemplateModal from "../../../components/Template/TemplateModal";
import { useUserStore } from "../../../store/userStore";
import { useTemplateStore } from "../../../store/TemplateStore";
import { Plus, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

import TemplateCard from "../../../components/Template/TemplateCard";
import DetailModal from "../../../components/Template/DetailModal";

const TemplateManager = () => {
  const { user, fetchUser } = useUserStore();
  const {
    workoutTemplates,
    dietTemplates,
    getWorkoutTemplates,
    getDietTemplates,
    createWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    createDietTemplate,
    updateDietTemplate,
    deleteDietTemplate,
    isLoadingWorkout,
    isLoadingDiet,
  } = useTemplateStore();

  const [activeTab, setActiveTab] = useState("workout");
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?._id) {
      getWorkoutTemplates(user._id);
      getDietTemplates(user._id);
    }
  }, [user?._id, getWorkoutTemplates, getDietTemplates]);

  const handleSave = async (data) => {
    if (activeTab === "workout") {
      if (editingId) {
        await updateWorkoutTemplate(editingId, data);
      } else {
        await createWorkoutTemplate({ ...data, trainerId: user._id });
      }
    } else {
      if (editingId) {
        await updateDietTemplate(editingId, data);
      } else {
        await createDietTemplate({ ...data, trainerId: user._id });
      }
    }
    // No refetch - assume store actions update the state locally
    setShowModal(false);
    setEditingId(null);
    setFormData({});
  };

  const handleEdit = (t) => {
    setFormData(t);
    setEditingId(t._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;
    if (activeTab === "workout") {
      await deleteWorkoutTemplate(id);
    } else {
      await deleteDietTemplate(id);
    }
    // No refetch - assume store actions update the state locally
  };

  const templates = activeTab === "workout" ? workoutTemplates : dietTemplates;
  const isLoading = activeTab === "workout" ? isLoadingWorkout : isLoadingDiet;

  // Pagination reset logic: Reset to page 1 if current page exceeds available pages after list length changes
  useEffect(() => {
    const totalPages = Math.ceil(templates.length / cardsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [templates.length, currentPage, cardsPerPage]);

  // pagination logic
  const totalPages = Math.ceil(templates.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const currentTemplates = templates.slice(
    startIndex,
    startIndex + cardsPerPage
  );

  const handleView = (type, data) => {
    setPreviewType(type);
    setPreviewData(data);
    setPreviewOpen(true);
  };

  return (
    <div className="p-6 h-full w-full max-w-full bg-cyan-50 rounded-lg space-y-6   overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black pb-4">
        <div className="flex bg-white/80 backdrop-blur rounded-lg border border-cyan-100 overflow-hidden shadow-sm">
          {["workout", "diet"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              whileHover={{ scale: 1.05 }}
              className={`px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-cyan-600 text-white shadow-inner"
                  : "text-gray-600 hover:text-cyan-600"
              }`}
            >
              {tab === "workout" ? "Workouts" : "Diets"}
            </motion.button>
          ))}
        </div>
        <motion.button
          onClick={() => {
            setFormData({});
            setEditingId(null);
            setShowModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
        >
          <Plus size={16} /> Add Template
        </motion.button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-12 animate-pulse">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FileText className="mx-auto mb-3 opacity-60" size={32} />
          </motion.div>
          <p className="text-sm">Loading Templates...</p>
        </div>
      ) : currentTemplates.length ? (
        <>
          {/* Cards Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {currentTemplates.map((t, idx) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  layout
                >
                  <TemplateCard
                    t={t}
                    type={activeTab}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination Controls */}
          {templates.length > cardsPerPage && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:bg-gray-300"
              >
                Prev
              </button>
              <span className="text-gray-700 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <FileText className="mx-auto mb-3 opacity-60" size={32} />
          <p className="text-sm font-medium">No templates yet.</p>
          <p className="text-xs mt-1">Create one to get started!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TemplateModal
          type={activeTab}
          editingTemplate={editingId ? formData : null}
          onClose={() => setShowModal(false)}
          onSave={(updatedData) => handleSave(updatedData)}
        />
      )}
      <AnimatePresence>
        {previewOpen && previewData && (
          <DetailModal
            isOpen={previewOpen}
            onClose={() => {
              setPreviewOpen(false);
              setPreviewData(null);
              setPreviewType(null);
            }}
            title={previewData.title}
            type={previewType}
            data={previewData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateManager;
