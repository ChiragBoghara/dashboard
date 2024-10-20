import { useContext, useState } from "react";
import "./Auth.scss";
import { AuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Flex, Spin } from "antd";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);
  const [isSignUp, setIsSignUp] = useState(true);
  const { currentUser, updateUser } = useContext(AuthContext);

  if (currentUser) return <Navigate to="/" />;

  const signup = async (username, password) => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3001/api/signup", {
        username,
        password,
      });

      console.log("Signup successful:", response.data);
      alert("Sign-up successful! Now you can sign in.");
      setIsSignUp(false);
    } catch (error) {
      setError(error.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3001/api/login", {
        username,
        password,
      },{ withCredentials: true });

      console.log("Login successful:", response.data);
      updateUser(username);
    } catch (error) {
      setError(error.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    if (isSignUp) {
      signup(username, password);
    } else {
      login(username, password);
    }
  };

  const toggleMode = () => {
    setError(undefined);
    setIsSignUp(!isSignUp);
  };

  return (
    <main className="sign-up__main">
      <section className="sign-up">
        <header className="sign-up__header">
          {isSignUp ? "Sign Up" : "Sign In"}
        </header>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" required />
          <input type="text" name="password" placeholder="Password" required />
          {error && <p className="error-message">{error}</p>}
          <button
            type="submit"
            disabled={loading} // Disable button while loading
            className={loading ? "loading" : ""} // Add a class for loader style
          >
            {loading ? (
              <Flex align="center" gap="middle">
                <Spin />
              </Flex>
            ) : isSignUp ? (
              "Get Started →"
            ) : (
              "Sign In →"
            )}
          </button>
          {/* <input
            type="submit"
            disabled={loading}
            name="submit"
            value={isSignUp ? "Get Started →" : "Sign In →"}
          /> */}
        </form>
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span className="toggle-button" onClick={() => toggleMode()}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </section>
    </main>
  );
};

export default Auth;
