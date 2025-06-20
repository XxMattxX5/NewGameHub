"use client";
import { useState, useEffect, useContext, createContext } from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { UserInfo, RegistrationError } from "../types";

type AuthContextType = {
  fetchUserInfo: () => void;
  login: (
    username: string,
    password: string,
    redirect?: string | null
  ) => Promise<string> | Promise<void>;
  register: (
    username: string,
    full_name: string,
    email: string,
    password: string,
    password_confirm: string
  ) => Promise<RegistrationError> | Promise<void>;
  logout: () => void;
  userInfo: UserInfo | null;
  csrfToken: string;
  isAuthenticated: boolean | null;
};

type Props = { children: React.ReactNode };

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/**
 * Custom hook for accessing authentication-related functions and user information.
 *
 * This hook provides an interface to manage authentication, including logging in, registering, logging out,
 * and fetching the current user information. It also exposes a CSRF token for secure operations.
 * The hook is intended to be used within the `AuthContext` provider to ensure proper access control and state management.
 *
 */
export const AuthProvider = ({ children }: Props) => {
  const router = useRouter();
  const cookies = useCookies();
  const csrfToken = cookies.get("csrftoken") || "";

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // When the user enters the page or refresh auth is check with a request to the backend
  // and if logged user information is grabbed for either local storage or from backend
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");

    // Checks if user is logged in
    const isLogged = async () => {
      if (await checkAuth()) {
        setIsAuthenticated(true);
        if (storedUserInfo) {
          setUserInfo(JSON.parse(storedUserInfo));
        } else {
          fetchUserInfo();
        }
      } else {
        setIsAuthenticated(false);
        sessionStorage.removeItem("userInfo");
      }
    };
    isLogged();
  }, []);

  // Sends request to backend to get authentication status
  const checkAuth = async () => {
    return fetch("/api/auth/is-logged/", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          return true;
        } else {
          return false;
        }
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
  };

  // Fetches the user's id, username, and profile picture
  const fetchUserInfo = async () => {
    const headers = {
      Accept: "application/json",
    };
    await fetch(`/api/user/info`, {
      method: "GET",
      headers: headers,
      credentials: "include",
      cache: "no-cache",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          localStorage.removeItem("userInfo");
          return;
        }
      })
      .then((data) => {
        if (data) {
          localStorage.setItem("userInfo", JSON.stringify(data));
          setUserInfo(data);
        }
        return;
      })
      .catch((error) => {
        console.error(error);
        return;
      });
  };

  // Attempts to login user and redirects them to given path if redirect is given
  const login = async (
    username: string,
    password: string,
    redirect?: string | null
  ) => {
    const headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    };

    return fetch(`/api/auth/login/`, {
      method: "POST",
      headers: headers,
      credentials: "include",
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          fetchUserInfo();
          if (redirect) {
            router.push(redirect);
          } else {
            router.push("/");
          }
          return;
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          return data.message;
        }
      })
      .catch((error) => console.error("error:", error));
  };

  // Creates a new user if the inputs are valid
  const register = async (
    username: string,
    full_name: string,
    email: string,
    password: string,
    password_confirm: string
  ) => {
    const headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    };

    return fetch(`/api/auth/register/`, {
      method: "POST",
      headers: headers,
      credentials: "include",
      body: JSON.stringify({
        username: username,
        full_name: full_name,
        email: email,
        password: password,
        password_confirm: password_confirm,
      }),
    })
      .then((res) => {
        if (res.status === 201) {
          router.push("/login?created=true");
          return;
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          return data.errors;
        }
      })
      .catch((error) => console.error("error:", error));
  };

  // Logs out user
  const logout = async () => {
    fetch(`/api/auth/logout/`, {
      credentials: "include",
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    })
      .then(() => {
        setUserInfo(null);
        setIsAuthenticated(false);
        localStorage.removeItem("userInfo");
        router.refresh();
      })
      .catch((error) => console.log(error));
  };

  return (
    <AuthContext.Provider
      value={{
        fetchUserInfo,
        login,
        register,
        logout,
        userInfo,
        csrfToken,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
