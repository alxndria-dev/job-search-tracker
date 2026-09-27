export const themeStorageKey = "huntr-theme";

export const themeInitScript = `(function(){try{if(localStorage.getItem(${JSON.stringify(themeStorageKey)})==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;

export type Theme = "light" | "dark";

export const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(themeStorageKey, theme);
};

export const readStoredTheme = (): Theme =>
  localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
