export const validateCaptcha = async (token) => {
  const hCaptchaSecret = process.env.CAPTCHA_SECRET;
  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: hCaptchaSecret,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success; 
  } catch (err) {
    console.error("hCaptcha validation failed:", err.message);
    return false;
  }
};
