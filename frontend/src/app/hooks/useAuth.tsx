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
    email: string,
    password: string,
    password_confirm: string
  ) => Promise<RegistrationError> | Promise<void>;
  logout: () => void;
  userInfo: UserInfo | null;
  csrfToken: string;
  // forgotPassword: (email: string) => void;
};

type Props = { children: React.ReactNode };

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: Props) => {
  const router = useRouter();
  const cookies = useCookies();
  const csrfToken = cookies.get("csrftoken") || "";

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");

    const isLogged = async () => {
      if (await checkAuth()) {
        if (storedUserInfo) {
          setUserInfo(JSON.parse(storedUserInfo));
        } else {
          fetchUserInfo();
        }
      } else {
        sessionStorage.removeItem("userInfo");
      }
    };
    isLogged();
  }, []);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
