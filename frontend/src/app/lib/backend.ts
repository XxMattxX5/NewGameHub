"use server";
export const checkRecoveryCode = async (code: string) => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost";
  return await fetch(`${backendUrl}/api/auth/login/reset-password/${code}`, {
    method: "GET",
    cache: "no-cache",
    headers: {
      Accept: "application/json",
    },
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
