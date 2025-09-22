export function MobileSidebar({ open, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-40 lg:hidden transition-transform ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative w-72 bg-white h-full shadow-xl p-6 flex flex-col">
        <button className="mb-4 self-end text-gray-500" onClick={onClose}>
          ✕
        </button>
        <Sidebar />
      </div>
    </div>
  );
}
