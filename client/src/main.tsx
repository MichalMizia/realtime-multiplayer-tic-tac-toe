import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { ToastBar, Toaster, toast } from "react-hot-toast";
import { cn } from "./lib/utils.ts";
import { XIcon } from "lucide-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />

    <Toaster position="top-center" reverseOrder={false}>
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            padding: t.className?.includes("custom") ? "0 " : "8px 10px",
            maxWidth: t.className?.includes("max-w-500") ? 500 : 350,
          }}
        >
          {({ icon, message }) =>
            t.className?.includes("custom") ? (
              <div
                className={cn(
                  "flex items-stretch rounded-sm shadow-md shadow-[#00000020]",
                  t.type === "success"
                    ? "bg-green-100 outline outline-2 outline-green-500"
                    : t.type === "error"
                    ? "border border-red-400 bg-red-100"
                    : "",
                  t.className
                )}
              >
                <div className="flex items-center justify-center gap-2 p-4">
                  {t.type === "success" || t.type === "error" ? (
                    <div className="aspect-square scale-125 rounded-full border bg-white p-2">
                      {icon}
                    </div>
                  ) : (
                    icon
                  )}
                  {message}
                </div>
                {t.type !== "loading" && (
                  <div className="flex items-start justify-end self-stretch p-1">
                    <button
                      className="z-10 rounded-full p-1 transition-all hover:bg-[#00000010]"
                      onClick={() => toast.dismiss(t.id)}
                    >
                      <XIcon />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {icon}
                {message}
              </>
            )
          }
        </ToastBar>
      )}
    </Toaster>
  </BrowserRouter>
);
