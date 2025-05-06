import { useState } from "react";
import "./App.css";

function App() {
  // Form field states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First Name is required";
    if (!lastName.trim()) newErrors.lastName = "Last Name is required";
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) newErrors.email = "Invalid email format";
    if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match";
    const dobPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dobPattern.test(dob)) {
      newErrors.dob = "Date of Birth must be in dd/mm/yyyy format";
    } else {
      // Verify actual date (including leap years
      const [day, month, year] = dob.split("/").map(Number);
      const dateObj = new Date(year, month - 1, day);
      if (
        dateObj.getFullYear() !== year ||
        dateObj.getMonth() + 1 !== month ||
        dateObj.getDate() !== day
      ) {
        newErrors.dob = "Date of Birth must be in dd/mm/yyyy format";
      }
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    alert("Form submitted successfully!");

    console.log({ firstName, lastName, email, password, confirmPassword, dob });
  };

  return (
    <div className="container">
      <h1>Create New Account</h1>
      <form noValidate onSubmit={handleSubmit} className="account-form">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {errors.firstName && (
            <span className="error">{errors.firstName}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="dob">Date of Birth(dd/mm/yyyy)</label>
          <input
            id="dob"
            type="text"
            placeholder="dd/mm/yyyy"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          {errors.dob && <span className="error">{errors.dob}</span>}
        </div>
        <button type="submit">SUBMIT</button>
      </form>
    </div>
  );
}

export default App;
