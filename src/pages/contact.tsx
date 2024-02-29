import React, { useState } from "react";

interface ContactFormProps {
  onSubmit: (data: { name: string; email: string; message: string }) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center">
      <div className="bg-white flex gap-4 rounded-lg shadow-lg p-8 m-4 max-w-xl max-h-full overflow-y-auto">
        <div>
          <div></div>
          <div className="text-sm mt-4">
            <p>Bernhard Bangs Allé 25</p>
            <p>2000 Frederiksberg</p>
            <p>CVR: 25121198</p>
            <a href="#" className="text-blue-600 hover:underline">
              Cookie policy
            </a>{" "}
            •{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy policy
            </a>
          </div>
          <div className="flex justify-around mt-4">
            {/* Replace these with actual icons */}
            <span>🔵</span>
            <span>📘</span>
            <span>🐦</span>
          </div>
          <div className="flex justify-between mt-4 text-sm">
            <span className="text-green-600">(+45) 3816 0000</span>
            <span className="text-green-600">kontakt@dwarf.dk</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg text-gray-900">
              To: <span className="text-green-500">Dwarf</span>
            </h2>
            <button
              onClick={() => {
                /* Close modal function */
              }}
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your message"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded"
            >
              Send
            </button>
          </form>
          <div className="text-xs text-gray-400 mt-4">
            This site is protected by reCAPTCHA and the Google
            <a href="#" className="text-blue-600 hover:underline">
              {" "}
              Privacy Policy
            </a>{" "}
            and
            <a href="#" className="text-blue-600 hover:underline">
              {" "}
              Terms of Service
            </a>{" "}
            apply.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
