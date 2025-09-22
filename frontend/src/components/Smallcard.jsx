const SmallCard = ({ title, value, note }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 md:p-5 flex flex-col justify-between">
      <div className="text-xs md:text-sm text-gray-500">{title}</div>
      <div className="mt-2 md:mt-4">
        <div className="text-lg md:text-2xl font-bold">{value}</div>
        {note && <div className="text-xs text-gray-400">{note}</div>}
      </div>
    </div>
  );
};

export default SmallCard;
