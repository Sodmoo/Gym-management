/* eslint-disable react-refresh/only-export-components */
import React, { useEffect } from "react";
import { useOnboardingStore } from "../store/useOnboardingStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// 🔹 Card component
const Card = ({ children }) => (
  <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-6">
    {children}
  </div>
);

// 🔹 Input component
const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
  />
);

// 🔹 Button component (саарал + blur disabled үед)
const Button = ({ children, variant = "primary", ...props }) => {
  const base =
    "px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:blur-[1px]";
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:hover:bg-gray-200",
  };
  return (
    <button {...props} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
};

// 🔹 Step1
const Step1 = () => {
  const { data, updateData, nextStep } = useOnboardingStore();
  const isValid = data.age && data.address;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card>
        <h2 className="text-2xl font-bold text-gray-800">
          Step 1: Үндсэн мэдээлэл
        </h2>
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Нас"
            value={data.age}
            onChange={(e) => updateData({ age: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Хаяг"
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={nextStep} disabled={!isValid}>
            Дараах
          </Button>
        </div>
      </Card>
    </div>
  );
};

// 🔹 Step2
const Step2 = () => {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  const isValid = data.height && data.weight && data.goal;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card>
        <h2 className="text-2xl font-bold text-gray-800">
          Step 2: Биеийн үзүүлэлт
        </h2>
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Өндөр (см)"
            value={data.height}
            onChange={(e) => updateData({ height: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Жин (кг)"
            value={data.weight}
            onChange={(e) => updateData({ weight: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Зорилго"
            value={data.goal}
            onChange={(e) => updateData({ goal: e.target.value })}
          />
        </div>
        <div className="flex justify-between">
          <Button variant="secondary" onClick={prevStep}>
            Буцах
          </Button>
          <Button onClick={nextStep} disabled={!isValid}>
            Дараах
          </Button>
        </div>
      </Card>
    </div>
  );
};

// 🔹 Step3
const Step3 = () => {
  const { data, updateData, prevStep, updateProfile, nextStep } =
    useOnboardingStore();
  const [preview, setPreview] = React.useState(null);

  const isValid = data.phone && data.avatar;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateData({ avatar: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("age", data.age);
    formData.append("address", data.address);
    formData.append("height", data.height);
    formData.append("weight", data.weight);
    formData.append("goal", data.goal);
    formData.append("phone", data.phone);
    if (data.avatar) formData.append("avatar", data.avatar);

    const result = await updateProfile(formData);
    if (result) {
      toast.success("Профайл амжилттай шинэчлэгдлээ!", {
        position: "top-right",
      });
      nextStep();
    } else {
      alert("Алдаа гарлаа. Дахин оролдоно уу.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Step 3: Зураг оруулах
        </h2>

        <div className="flex flex-col items-center space-y-4">
          {/* 🔹 Circle Profile Upload */}
          <label
            htmlFor="avatarUpload"
            className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden shadow-md hover:shadow-lg transition"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">+ Upload</span>
            )}
          </label>
          <input
            id="avatarUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Phone input */}
          <Input
            type="text"
            placeholder="Утасны дугаар"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <Button variant="secondary" onClick={prevStep}>
            Буцах
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Дуусгах
          </Button>
        </div>
      </Card>
    </div>
  );
};

const Step4 = () => {
  const navigate = useNavigate();
  const { reset } = useOnboardingStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      reset();
      navigate("/");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, reset]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-600">🎉 Баяр хүргэе!</h2>
          <p className="text-gray-600">
            Таны профайл амжилттай бүрдлээ. Та удахгүй эхлэл хуудас руу шилжинэ.
          </p>
        </div>
      </Card>
    </div>
  );
};

const Setup_profile = () => {
  const { step } = useOnboardingStore();

  return (
    <div>
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
    </div>
  );
};

export default Setup_profile;
